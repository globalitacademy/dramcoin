import React, { useState, useRef, useEffect } from 'react';
import { getMarketAnalysis } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { translations } from '../translations';

const AIAssistant: React.FC = () => {
  const { language } = useStore();
  const t = translations[language].ai;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting based on language
  useEffect(() => {
    setMessages([{ role: 'model', text: t.welcome }]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getMarketAnalysis(userMsg.text, "BTC/USDT Trading View");
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: language === 'AM' ? "Կներեք, սխալ տեղի ունեցավ:" : "Sorry, an error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-binance-yellow to-yellow-500 text-black p-4 rounded-full shadow-lg hover:shadow-yellow-500/20 transition-all z-50 flex items-center gap-2 font-bold"
      >
        <Sparkles size={20} />
        <span className="hidden md:inline">{t.btn}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-[350px] h-[500px] bg-binance-black border border-binance-gray rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-binance-gray p-4 flex justify-between items-center border-b border-binance-dark">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-binance-yellow rounded-lg">
            <Bot size={18} className="text-black" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{t.title}</h3>
            <p className="text-xs text-binance-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-binance-green rounded-full animate-pulse"></span>
              {t.online}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-binance-subtext hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e2026]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-binance-yellow text-black rounded-tr-sm' 
                  : 'bg-binance-gray text-binance-text rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-binance-gray p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-binance-yellow" />
              <span className="text-xs text-binance-subtext">{t.analyzing}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-binance-black border-t border-binance-gray flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t.placeholder}
          className="flex-1 bg-binance-dark text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-binance-yellow border border-transparent focus:border-binance-yellow/50 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-binance-yellow text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;