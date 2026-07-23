import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  const welcomeMessage = `Assalam-o-Alaikum! 👋 Welcome to "Trylo" Premium Store. 

Main aapka personal fashion stylist hoon. Aaj main aapko styling, color matching, aur sizing mein guide karunga. 

Main aapki kya madad kar sakta hoon? 👇`;

  const [messages, setMessages] = useState([
    { sender: "bot", text: welcomeMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    { text: "Kurta Matchings 🌟", query: "Black kurta ke sath waistcoat aur pants ka combination batao." },
    { text: "Casual Dinner Wear 👕", query: "Doston ke sath dinner par jana hai, koi elite Western combo suggest karo." },
    { text: "Exchange Policy 🔄", query: "Agar size ka masla ho toh exchange policy kya hai?" }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    
    const userMessage = customQuery ? customQuery.trim() : input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    if (!customQuery) setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/chat", { message: userMessage });
      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: `❌ BACKEND ERROR: ${res.data.message}` }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: `🔴 API Connection Error. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* 🟢 CHAT FLOATING TOGGLE BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-[#C19A6B] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group cursor-pointer border border-neutral-800"
          title="Open Fashion Assistant"
        >
          <MessageSquare size={22} className="group-hover:rotate-12 transition-transform text-[#C19A6B] group-hover:text-white" />
        </button>
      )}

      {/* 🔵 MAIN CHAT WINDOW INTERFACE - FIXED POSITIONING */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[90vw] sm:w-[380px] h-[500px] rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* HEADER BAR */}
          <div className="bg-black text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-[#C19A6B] p-2 rounded-xl text-white shadow-sm">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 uppercase">
                  Trylo Fashion AI <Sparkles size={14} className="text-[#C19A6B] fill-[#C19A6B]" />
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online Stylist
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-white transition p-1.5 rounded-xl hover:bg-neutral-900 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES LOG VIEWPORT */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm whitespace-pre-line leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-black text-white rounded-tr-none font-medium" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                  <Loader2 size={14} className="animate-spin text-[#C19A6B]" />
                  <span>Stylist is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK SUGGESTION BUTTONS ROW */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 bg-gray-50/80 flex flex-wrap gap-1.5 border-t border-gray-100">
              {quickPrompts.map((prompt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSendMessage(null, prompt.query)} 
                  className="bg-white hover:bg-black hover:text-white text-gray-700 text-[11px] font-medium px-3 py-1.5 rounded-full border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about styling, outfits..."
              className="w-full bg-gray-50 text-xs sm:text-sm border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B] text-black placeholder-gray-400"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-black hover:bg-[#C19A6B] disabled:opacity-50 text-white p-3 rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}