import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { gatewayService } from '../services/gatewayService';
import { ChatMessage } from '../types';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Hello! I'm your Inspection Assistant powered by Gemini 3.0 Pro. Ask me about building codes, recent issues, or help with property analysis.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await gatewayService.sendChatMessage(userMsg.text, messages);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center gap-2"
      >
        <Sparkles size={24} />
        <span className="font-medium pr-1">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-400" />
          <h3 className="font-semibold">Inspection Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
              {msg.groundingMetadata?.sources && (
                 <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-purple-600 flex items-center gap-1">
                    <Sparkles size={10} />
                    Sources: {msg.groundingMetadata.sources.join(', ')}
                 </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
               <Bot size={14} />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm">
               <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about codes, issues, or analysis..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 text-center">
           Powered by Gemini 3.0 Pro & Google Search Grounding
        </div>
      </div>
    </div>
  );
};
