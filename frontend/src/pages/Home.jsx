import React, { useState, useEffect } from 'react';
import { Send, Loader, Sparkles, Mic, MicOff, User, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ragChat, registerVisitor } from '../services/api.service';

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    
    // Onboarding State
    const [onboardingStep, setOnboardingStep] = useState(0); // 1: Name, 2: Mobile, 0: Done
    const [visitor, setVisitor] = useState({ name: '', mobile: '', id: null });

    useEffect(() => {
        // Initial setup
        const savedVisitor = localStorage.getItem('campus_visitor');
        if (savedVisitor) {
            const parsedVisitor = JSON.parse(savedVisitor);
            setVisitor(parsedVisitor);
            setOnboardingStep(0);
            setMessages([{ role: 'assistant', content: `Welcome back, ${parsedVisitor.name}! How can I assist you today?` }]);
        } else {
            setOnboardingStep(1);
            setMessages([{ role: 'assistant', content: "Hello! I am your AI Campus Guide. Before we start, may I know your full name?" }]);
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setInput(prev => prev + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const toggleListening = () => {
        if (!recognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const userText = input.trim();
        if (!userText) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }

        // Add user message immediately
        const userMsg = { role: 'user', content: userText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Handle Onboarding Steps
        if (onboardingStep === 1) {
            setVisitor(prev => ({ ...prev, name: userText }));
            setOnboardingStep(2);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: `Nice to meet you, ${userText}! And what is your mobile number?` }]);
            }, 600);
            return;
        }

        if (onboardingStep === 2) {
            setIsLoading(true);
            try {
                const visitorData = { name: visitor.name, mobile: userText };
                const registered = await registerVisitor(visitorData);
                const updatedVisitor = { ...visitorData, id: registered.id };
                
                setVisitor(updatedVisitor);
                localStorage.setItem('campus_visitor', JSON.stringify(updatedVisitor));
                setOnboardingStep(0);
                
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Thank you! Registration complete. You can now ask me any questions about the campus." }]);
                }, 600);
            } catch (error) {
                setMessages(prev => [...prev, { role: 'assistant', content: "I had trouble saving your details. Let's try again with your mobile number?" }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Normal RAG Chat
        setIsLoading(true);
        try {
            const response = await ragChat(userText, visitor.id);
            setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection Error: Make sure your backend API is online.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-36 pb-10 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex justify-between items-center text-slate-500">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={24} />
            </div>
            <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Assistant</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Sementic Engine Online</p>
            </div>
        </div>

        {visitor.name && (
            <button 
                onClick={() => {
                    if(window.confirm("Restart conversation and clear your session?")) {
                        localStorage.removeItem('campus_visitor');
                        window.location.reload();
                    }
                }}
                className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-100 shadow-sm"
            >
                Reset Session
            </button>
        )}
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
          <button
            type="button"
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all relative overflow-hidden ${
              isListening 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-100'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={24} className="relative z-10" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-red-400 rounded-2xl"
                />
              </>
            ) : (
              <Mic size={24} />
            )}
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
                onboardingStep === 1 ? "Enter your name..." : 
                onboardingStep === 2 ? "Enter mobile number..." : 
                isListening ? "Listening deeply..." : "Search academic data, hostel rules, courses..."
            }
            className={`w-full bg-transparent text-slate-900 px-4 py-4 min-h-[55px] outline-none placeholder-slate-400 font-bold transition-all ${isListening || onboardingStep > 0 ? 'placeholder-blue-400' : ''}`}
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
