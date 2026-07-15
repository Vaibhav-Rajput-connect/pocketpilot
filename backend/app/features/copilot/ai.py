import os
import json
from typing import AsyncGenerator
from fastapi import BackgroundTasks
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.embeddings import Embeddings
from google import genai

from app.config import settings

# Global dictionary to store FAISS indices per user (in-memory for this implementation)
# Key: user_id (str), Value: FAISS vector store
user_vector_stores: dict[str, FAISS] = {}
user_vector_errors: dict[str, str] = {}

# Lazy initialization for the genai client
_genai_client = None
_embeddings = None

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "gemini-2.0-flash"


def get_genai_client():
    """Gets or creates the google-genai client."""
    global _genai_client
    if _genai_client is None:
        if settings.gemini_api_key:
            _genai_client = genai.Client(api_key=settings.gemini_api_key)
        else:
            print("Failed to initialize genai client: GEMINI_API_KEY is not configured in .env")
    return _genai_client


class GenAIEmbeddings(Embeddings):
    """Custom LangChain Embeddings wrapper using google-genai SDK."""

    def __init__(self):
        super().__init__()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of documents using google-genai SDK."""
        client = get_genai_client()
        if not client:
            raise ValueError("Gemini API client not initialized")
        
        all_embeddings = []
        # Process in batches of 100 (API limit)
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=batch
            )
            for embedding in result.embeddings:
                all_embeddings.append(embedding.values)
        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        """Embed a single query using google-genai SDK."""
        client = get_genai_client()
        if not client:
            raise ValueError("Gemini API client not initialized")
        
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text
        )
        return result.embeddings[0].values


def get_embeddings():
    """
    Initializes the embedding model based on environment configuration.
    Defaults to Gemini if configured, otherwise fails gracefully.
    """
    global _embeddings
    if _embeddings is None:
        try:
            if settings.gemini_api_key:
                _embeddings = GenAIEmbeddings()
            else:
                print("Failed to initialize embeddings: GEMINI_API_KEY is not configured in .env")
                _embeddings = None
        except Exception as e:
            print(f"Failed to initialize embeddings: {e}")
            _embeddings = None
    return _embeddings


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
    
    # Chunk transactions into groups of 20 to avoid hitting the 100 RPM Gemini API limit
    chunk_size = 20
    for i in range(0, len(transactions), chunk_size):
        chunk = transactions[i:i + chunk_size]
        chunk_text_parts = []
        
        for t in chunk:
            date_str = str(t.get("date", "Unknown")).split("T")[0]
            ttype = str(t.get("type", "UNKNOWN")).capitalize()
            amount = f"₹{float(t.get('amount', 0)):.2f}"
            merchant = str(t.get("merchant", "Unknown"))
            category = str(t.get("category", "Others"))
            desc = str(t.get("description", ""))
            
            chunk_text_parts.append(f"[{date_str}] {ttype} of {amount} at {merchant} ({category}). Desc: {desc}")
            
        chunk_text = "\n".join(chunk_text_parts)
        docs.append(chunk_text)
        
        metadatas.append({
            "chunk_index": i // chunk_size,
            "transaction_count": len(chunk)
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
    # Check if client is configured first
    client = get_genai_client()
    if not client:
        yield f"data: Configuration Error: GEMINI_API_KEY is not configured in .env. Please add your Gemini API Key in the backend environment variables.\n\n"
        return

    vector_store = get_user_index(str(user_id))
    
    if not vector_store:
        error_msg = user_vector_errors.get(str(user_id), "Unknown indexing error.")
        yield f"data: Error building index: {error_msg}. Please check your API key and try again.\n\n"
        return
        
    # Retrieve top 20 relevant transactions
    try:
        retriever = vector_store.as_retriever(search_kwargs={"k": 20})
        # This calls the embedding API synchronously which can fail!
        docs = retriever.invoke(query)
        context_text = "\n".join([d.page_content for d in docs])
    except Exception as e:
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
    
    # Build conversation contents for google-genai
    contents = []
    if history:
        for msg in history:
            if msg["role"] == "user":
                contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
            elif msg["role"] == "assistant":
                contents.append({"role": "model", "parts": [{"text": msg["content"]}]})
                
    # Add the current prompt
    contents.append({"role": "user", "parts": [{"text": final_prompt}]})
    
    # Stream the response using google-genai
    try:
        response_stream = client.models.generate_content_stream(
            model=CHAT_MODEL,
            contents=contents,
            config={
                "temperature": 0.2,
            }
        )
        for chunk in response_stream:
            if chunk.text:
                data = json.dumps({"text": chunk.text})
                yield f"data: {data}\n\n"
                
    except Exception as e:
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or "API key not valid" in error_msg:
            clean_msg = "\n\nError: The Gemini API Key is invalid or missing. Please provide a valid API key in the backend environment variables."
        else:
            clean_msg = f"\n\nError generating response: {error_msg}"
            
        data = json.dumps({"text": clean_msg})
        yield f"data: {data}\n\n"
        
    # Send done signal
    yield "data: [DONE]\n\n"
