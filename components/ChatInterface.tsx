
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Lumina AI Consultant</h3>
          <p className="text-xs text-indigo-100">Design refine & Shopping assist</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">Ask me to change colors, add furniture, or find where to buy items in the design!</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              {m.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                  <img src={m.imageUrl} alt="Updated design" className="w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 'Make the rug blue' or 'Where can I buy that chair?'"
          className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          disabled={isTyping}
        />
        <button 
          type="submit"
          disabled={isTyping || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
