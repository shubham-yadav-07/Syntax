import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const messages = [
    { role: "ai", text: "Hi! I'm your AI assistant. How can I help you today?" },
    {
      role: "user",
      text: "Can you explain the time complexity of my code?",
    },
    {
      role: "ai",
      text: "Your code has O(n²) complexity due to nested loops. I can suggest optimizations!",
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded bg-primary flex items-center justify-center">
                <MessageCircle className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm text-white">AI Assistant</h3>
                <p className="text-xs text-slate-400">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="size-8 rounded hover:bg-[#334155] flex items-center justify-center"
            >
              <X className="size-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-[#0F172A] text-slate-200 border border-[#334155]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#334155]">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md focus:outline-none focus:border-primary text-sm text-white placeholder:text-slate-500"
              />
              <button className="size-9 rounded-md bg-primary hover:bg-primary/90 flex items-center justify-center">
                <Send className="size-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 size-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center z-50"
      >
        <MessageCircle className="size-5 text-white" />
      </button>
    </>
  );
}
