import os
import uuid
from typing import AsyncGenerator
from fastapi import BackgroundTasks
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.config import settings

# Global dictionary to store FAISS indices per user (in-memory for this implementation)
# Key: user_id (str), Value: FAISS vector store
user_vector_stores: dict[str, FAISS] = {}
user_vector_errors: dict[str, str] = {}

# Lazy initialization for the embeddings model to prevent import-time download/errors
_embeddings = None

def get_embeddings():
    """
    Initializes the embedding model based on environment configuration.
    Defaults to Gemini if configured, otherwise fails gracefully.
    """
    global _embeddings
    if _embeddings is None:
        try:
            if settings.gemini_api_key:
                _embeddings = GoogleGenerativeAIEmbeddings(
                    model="models/embedding-001",
                    google_api_key=settings.gemini_api_key
                )
            else:
                print("Failed to initialize embeddings: GEMINI_API_KEY is not configured in .env")
                _embeddings = None
        except Exception as e:
            print(f"Failed to initialize embeddings: {e}")
            _embeddings = None
    return _embeddings

def get_llm(streaming: bool = False):
    """
    Initializes the LLM based on environment configuration.
    Defaults to Gemini if configured, otherwise fails gracefully.
    """
    if settings.gemini_api_key:
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.gemini_api_key,
            temperature=0.2,
            streaming=streaming
        )
    # If no key is set, we could raise an error or return a mock for testing
    raise ValueError("GEMINI_API_KEY is not configured in .env")

def build_user_index(user_id: str, transactions: list[dict]):
    """
    Builds an in-memory FAISS vector store for a specific user's transactions.
    If no transactions exist, builds an empty index as a fallback.
    """
    if not transactions:
        # Create an empty index if no transactions
        embed_model = get_embeddings()
        if not embed_model:
            print("Warning: Embeddings model not available, using empty FAISS fallback")
            return
        try:
            user_vector_stores[str(user_id)] = FAISS.from_texts(["No transaction data available yet."], embed_model)
            if str(user_id) in user_vector_errors:
                del user_vector_errors[str(user_id)]
        except Exception as e:
            print(f"Failed to build empty FAISS index: {e}")
            user_vector_stores[str(user_id)] = None
            user_vector_errors[str(user_id)] = str(e)
        return

    docs = []
    metadatas = []
    
    for t in transactions:
        # Create a rich text description of the transaction
        date_str = t["date"].split("T")[0]
        ttype = t["transaction_type"].capitalize()
        amount = f"₹{float(t['amount']):.2f}"
        merchant = t.get("merchant") or "Unknown"
        category = t.get("category") or "Others"
        desc = t.get("description") or "No description"
        
        text = f"On {date_str}, there was a {ttype} transaction of {amount} at {merchant} in the {category} category. Description: {desc}"
        
        docs.append(text)
        metadatas.append({
            "id": t["id"],
            "date": date_str,
            "amount": float(t["amount"]),
            "merchant": merchant,
            "category": category,
            "type": ttype
        })
        
    # Build FAISS index
    embed_model = get_embeddings()
    if not embed_model:
        print("Warning: Embeddings model not available, skipping FAISS build")
        return
    try:
        vector_store = FAISS.from_texts(texts=docs, embedding=embed_model, metadatas=metadatas)
        user_vector_stores[str(user_id)] = vector_store
        if str(user_id) in user_vector_errors:
            del user_vector_errors[str(user_id)]
    except Exception as e:
        print(f"Failed to build FAISS index: {e}")
        # Build an empty/fallback index so we don't crash next time
        user_vector_stores[str(user_id)] = None
        user_vector_errors[str(user_id)] = str(e)


def get_user_index(user_id: str) -> FAISS | None:
    return user_vector_stores.get(str(user_id))


# Define the prompt template
SYSTEM_PROMPT = """You are PocketPilot AI, an intelligent personal financial advisor and wealth planner.
You have access to the user's transaction history and their overall financial summary via the context provided below.

Overall Financial Summary:
{summary_context}

Recent Relevant Transactions:
{context}

Guidelines:
- Act as a proactive financial planner. If the user asks for a financial plan, budget, or investment advice based on their savings/income, provide a comprehensive and structured plan (e.g., using the 50/30/20 rule, emergency fund recommendations, or general investment strategies).
- Do not restrict yourself to only stating facts from the context. You are encouraged to provide estimates, forward-looking advice, and hypothetical scenarios to help the user grow their wealth.
- Always present monetary values clearly (e.g., ₹5,000).
- Be professional, encouraging, and highly structured in your advice (use bullet points or headers).
- Add a standard disclaimer that you are an AI and this is not professional financial advice if providing a major plan.

Question: {question}
Answer:"""

prompt_template = PromptTemplate(
    template=SYSTEM_PROMPT,
    input_variables=["summary_context", "context", "question"]
)

async def stream_chat_response(user_id: str, query: str, history: list[dict] = None, summary_context: str = "") -> AsyncGenerator[str, None]:
    """
    Retrieves relevant transactions, queries the LLM, and streams the response chunks.
    Yields chunks formatted for Server-Sent Events (SSE).
    """
    # Check if LLM is configured first
    try:
        llm = get_llm(streaming=True)
    except ValueError as e:
        yield f"data: Configuration Error: {str(e)}. Please add your Gemini API Key in the backend .env file.\n\n"
        return

    vector_store = get_user_index(str(user_id))
    
    if not vector_store:
        yield "data: Error: I don't have your transactions indexed yet, or your API key is invalid. Please check your Gemini API key and try again.\n\n"
        return
        
    # Retrieve top 20 relevant transactions
    try:
        retriever = vector_store.as_retriever(search_kwargs={"k": 20})
        # This calls the embedding API synchronously which can fail!
        docs = retriever.invoke(query)
        context_text = "\n".join([d.page_content for d in docs])
    except Exception as e:
        import json
        clean_msg = f"\n\nError connecting to Gemini Embeddings API: {str(e)}. Please check your API key and rate limits."
        data = json.dumps({"text": clean_msg})
        yield f"data: {data}\n\n"
        yield "data: [DONE]\n\n"
        return
    
    # Build the full prompt
    final_prompt = prompt_template.format(
        summary_context=summary_context,
        context=context_text,
        question=query
    )
    
    # Support conversation history
    messages = []
    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
                
    # Add the current prompt
    messages.append(HumanMessage(content=final_prompt))
    
    # Stream the response
    try:
        async for chunk in llm.astream(messages):
            if chunk.content:
                # Replace newlines with a specific token or just yield raw content if client handles it
                # For SSE, sending raw text per chunk is usually fine if client concatenates.
                # To be safe with SSE parsing, we can send JSON-encoded chunks or just replace newlines.
                import json
                data = json.dumps({"text": chunk.content})
                yield f"data: {data}\n\n"
                
    except Exception as e:
        import json
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or "API key not valid" in error_msg:
            clean_msg = "\n\nError: The Gemini API Key is invalid or missing. Please provide a valid API key in the backend environment variables."
        else:
            clean_msg = f"\n\nError generating response: {error_msg}"
            
        data = json.dumps({"text": clean_msg})
        yield f"data: {data}\n\n"
        
    # Send done signal
    yield "data: [DONE]\n\n"
