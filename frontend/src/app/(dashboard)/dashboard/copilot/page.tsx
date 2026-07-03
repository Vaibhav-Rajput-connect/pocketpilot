"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **PocketPilot AI**, your personal financial assistant.\n\nI have access to your transaction history. You can ask me things like:\n- *Where did I spend the most money this year?*\n- *How much did I spend on food last month?*\n- *Can I afford a ₹60,000 laptop based on my current savings?*\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // We will use standard fetch for SSE stream reading
      let token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      
      const requestBody = JSON.stringify({
        query: userMessage.content,
        history: messages.filter(m => m.role !== "system").map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      let response = await fetch(`${apiUrl}/copilot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: requestBody
      });

      // If token expired, try to refresh it using the apiClient interceptor
      if (response.status === 401) {
        try {
          const { apiClient } = await import("@/lib/api-client");
          await apiClient.get("/users/me");
          token = localStorage.getItem("access_token");
          
          response = await fetch(`${apiUrl}/copilot/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: requestBody
          });
        } catch (e) {
          // Fall through to general error handler
        }
      } 
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantContent = "";
      
      // Add empty assistant message to start appending to
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr === "[DONE]") {
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  assistantContent += data.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantContent;
                    return updated;
                  });
                }
              } catch (e) {
                // If not JSON, it might just be text
                if (!dataStr.startsWith("{")) {
                  assistantContent += dataStr;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantContent;
                    return updated;
                  });
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please make sure the backend is running and the API keys are configured." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full pt-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PocketPilot AI</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            Your AI financial advisor
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-card/60 backdrop-blur-sm shadow-sm relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === "user" ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"}`}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 flex-row"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-muted flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/50">
          <div className="flex gap-3 relative">
            <Input
              placeholder="Ask anything about your finances..."
              className="flex-1 rounded-full px-6 bg-muted/50 border-border/50 focus-visible:ring-emerald-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="rounded-full w-10 h-10 p-0 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            AI can make mistakes. Consider verifying important financial decisions.
          </p>
        </div>
      </Card>
    </div>
  );
}
