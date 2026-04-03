import React, { useState, useEffect } from 'react';
import { Send, Loader, Sparkles, Mic, MicOff, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ragChat, registerVisitor, lookupVisitor } from '../services/api.service';

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    
    // Onboarding State
    const [step, setStep] = useState('askMobile'); // 'askMobile' | 'askEmail' | 'askName' | 'chat'
    const [visitor, setVisitor] = useState({ name: '', mobile: '', email: '', id: null });
    const [isEndingSession, setIsEndingSession] = useState(false);

    const maskMobile = (mobile) => {
        if (!mobile) return "";
        return mobile.length > 4 
            ? mobile.slice(0, 2) + "*****" + mobile.slice(-4)
            : "*****" + mobile.slice(-2);
    };

    useEffect(() => {
        // Initial setup - Use sessionStorage for shared device safety
        const savedSession = sessionStorage.getItem('campus_visitor_session');
        if (savedSession) {
            const parsedVisitor = JSON.parse(savedSession);
            setVisitor(parsedVisitor);
            
            if (!parsedVisitor.email) {
                setStep('askEmail');
                setMessages([{ role: 'assistant', content: `Welcome back, ${parsedVisitor.name}! We need your email address to send you the chat reports. What is your email?` }]);
            } else {
                setStep('chat');
                setMessages([{ role: 'assistant', content: `Welcome back, ${parsedVisitor.name}! How can I assist you today?` }]);
            }
        } else {
            setStep('askMobile');
            setMessages([{ role: 'assistant', content: "Hi! I'm Zhara, your AI Campus Guide 👋\nTo get started, please enter your mobile number." }]);
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

    const handleSend = async (e, directVal = null) => {
        if (e) e.preventDefault();
        const userText = directVal || input.trim();
        if (!userText) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }

        // Add user message to log (mask mobile if in askMobile step)
        const displayMsg = step === 'askMobile' ? maskMobile(userText) : userText;
        setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);
        setInput('');

        // 1. Capture Mobile Number
        if (step === 'askMobile') {
            const mobile = userText.replace(/\D/g, "");
            if (mobile.length !== 10) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: "That doesn't look like a 10-digit number. 🧐 Please try again." }]);
                }, 500);
                return;
            }

            setIsLoading(true);
            try {
                const existingVisitor = await lookupVisitor(mobile);
                setVisitor(existingVisitor);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(existingVisitor));
                
                if (!existingVisitor.email) {
                    setStep('askEmail');
                    setTimeout(() => {
                        setMessages(prev => [...prev, { role: 'assistant', content: `Welcome back, ${existingVisitor.name}! May I have your email address to send your chat reports?` }]);
                    }, 600);
                } else {
                    setStep('chat');
                    setTimeout(() => {
                        setMessages(prev => [...prev, { role: 'assistant', content: `Welcome back, ${existingVisitor.name}! 😊 How can I help you today?` }]);
                    }, 600);
                }
            } catch (error) {
                // New User -> Ask for Email first
                setVisitor(prev => ({ ...prev, mobile }));
                setStep('askEmail');
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: "I don't think we've met! May I have your email address first?" }]);
                }, 600);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // 2. Capture Email
        if (step === 'askEmail') {
            const email = userText.toLowerCase().trim().replace(/\s/g, "");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: "That doesn't look like a valid email address. 🧐 Please try again." }]);
                }, 500);
                return;
            }

            setVisitor(prev => ({ ...prev, email }));
            
            if (visitor.name) {
                // If we already have a name (from returning user), go to chat
                setStep('chat');
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: `Got it! I've updated your email. How can I help you today?` }]);
                }, 600);
            } else {
                setStep('askName');
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Got it! And what is your full name?" }]);
                }, 600);
            }
            return;
        }

        // 3. Capture Name
        if (step === 'askName') {
            setIsLoading(true);
            try {
                const visitorData = { name: userText, mobile: visitor.mobile, email: visitor.email };
                const registered = await registerVisitor(visitorData);
                const updatedVisitor = { ...visitorData, id: registered.id };
                
                setVisitor(updatedVisitor);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(updatedVisitor));
                setStep('chat');
                
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'assistant', content: `Welcome, ${userText}! How can I help you today?` }]);
                }, 600);
            } catch (error) {
                setMessages(prev => [...prev, { role: 'assistant', content: "I had trouble saving your details. Could you try telling me your name again?" }]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // 3. Normal RAG Chat
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

    const handleEndSession = async () => {
        if (!visitor.id) return;
        
        setIsEndingSession(true);
        const { toast } = await import('sonner');
        const loadingToast = toast.loading("Generating report and sending email...");

        try {
            const { endSession: endSessionApi } = await import('../services/api.service');
            await endSessionApi(visitor.id);

            toast.success("Report sent to your email successfully! ✅", { id: loadingToast });
            
            // Clear session
            sessionStorage.removeItem('campus_visitor_session');
            setVisitor({ name: '', mobile: '', email: '', id: null });
            setStep('askMobile');
            setMessages([{ role: 'assistant', content: "Session ended. To start a new chat, please enter your mobile number again." }]);
        } catch (error) {
            console.error("End session error:", error);
            toast.error(error.response?.data?.error || "Failed to send report. Please check if your email is valid.", { id: loadingToast });
        } finally {
            setIsEndingSession(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-36 pb-10 px-4 relative">
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

        {visitor.id && (
            <button 
                onClick={handleEndSession}
                disabled={isEndingSession}
                className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-100 shadow-sm disabled:opacity-50"
            >
                {isEndingSession ? 'Sending...' : 'End Session'}
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
                step === 'askMobile' ? "Enter your mobile number..." : 
                step === 'askEmail' ? "Enter your email address..." :
                step === 'askName' ? "Tell me your name..." : 
                isListening ? "Listening deeply..." : "Search academic data, hostel rules, courses..."
            }
            className={`w-full bg-transparent text-slate-900 px-4 py-4 min-h-[55px] outline-none placeholder-slate-400 font-bold transition-all ${isListening || step !== 'chat' ? 'placeholder-blue-400' : ''}`}
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
