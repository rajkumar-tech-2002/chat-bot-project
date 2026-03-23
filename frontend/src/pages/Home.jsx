import React, { useState } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ragChat } from '../services/api.service';

const Home = () => {
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am your AI Campus Guide. Ask me anything about university policies, tuition, or campus life!' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await ragChat(userMsg.content);
            setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection Error: Make sure your backend API is online.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-36 pb-10 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center space-x-4 text-slate-500">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-lg shadow-blue-500/20">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Assistant</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Sementic Engine Online</p>
        </div>
      </motion.div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide mb-8 pr-2">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-[2rem] px-7 py-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-none shadow-xl shadow-blue-600/20' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-md'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Campus Guide</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-bold">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none px-7 py-5 flex items-center space-x-4 text-slate-400 shadow-md">
              <Loader className="animate-spin text-blue-600" size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Synthesizing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white/70 backdrop-blur-3xl rounded-[2rem] p-3 border border-white shadow-[0_20px_50px_-10px_rgba(30,58,138,0.1)] mx-2 group">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search academic data, hostel rules, courses..."
            className="w-full bg-transparent text-slate-900 px-6 py-4 min-h-[55px] outline-none placeholder-slate-400 font-bold"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="p-4 bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl text-white transition-all disabled:opacity-30 shadow-xl shadow-blue-600/30 mr-1"
          >
            <Send size={24} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Home;
