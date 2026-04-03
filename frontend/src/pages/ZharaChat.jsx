import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft, Sparkles, GraduationCap, LogOut } from 'lucide-react';
import { ragChat, saveAudio, lookupVisitor, registerVisitor } from '../services/api.service';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// ── Speaking Waveform bars ────────────────────────────────────────────────────
const SoundBars = ({ active, color = '#7c3aed' }) => (
    <div className="flex items-end gap-1 h-8">
        {[0.4, 0.7, 1, 0.7, 0.4, 0.6, 0.9, 0.6, 0.4].map((h, i) => (
            <motion.div
                key={i}
                className="w-1.5 rounded-full"
                animate={active ? { scaleY: [h, 1, h * 0.5, h], opacity: [1, 0.8, 1] } : { scaleY: 0.2, opacity: 0.3 }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: 'loop', delay: i * 0.07 }}
                style={{ originY: 1, height: 32, backgroundColor: color }}
            />
        ))}
    </div>
);

const ZharaChat = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const gender = searchParams.get('gender') || 'female';
    const name = gender === 'female' ? 'Zhara' : 'Zaid';

    // Screens logic handled by routing now
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [visitor, setVisitor] = useState({ name: '', mobile: '', email: '', id: null });
    const [isEndingSession, setIsEndingSession] = useState(false);

    // Voice state
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [statusText, setStatusText] = useState('Tap the mic to speak');

    // Chat log
    const [chatLog, setChatLog] = useState([]);

    // Refs
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const synthRef = useRef(window.speechSynthesis);
    const voicesRef = useRef([]);
    const chatEndRef = useRef(null);
    const streamRef = useRef(null);
    const transcriptRef = useRef('');

    const maskMobile = (mobile) => {
        if (!mobile) return "";
        return mobile.length > 4
            ? mobile.slice(0, 2) + "*****" + mobile.slice(-4)
            : "*****" + mobile.slice(-2);
    };

    // ── Speak helper ─────────────────────────────────────────────────────────
    const speak = useCallback((text, selectedGender) => {
        if (isMuted) return;
        synthRef.current.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        const voices = voicesRef.current;

        const genderKeywords = selectedGender === 'female'
            ? ['female', 'woman', 'girl', 'zira', 'helen', 'hazel', 'sofia', 'samantha']
            : ['male', 'man', 'david', 'mark', 'daniel', 'alex', 'james', 'george'];

        const picked = voices.find(v =>
            genderKeywords.some(k => v.name.toLowerCase().includes(k))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (picked) utter.voice = picked;
        utter.pitch = selectedGender === 'female' ? 1.15 : 0.9;
        utter.rate = 1.0;
        utter.volume = 1;

        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => {
            setIsSpeaking(false);
            setStatusText('Tap the mic to speak');
        };
        utter.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utter);
    }, [isMuted]);

    // ── Load voices & Check Session ──────────────────────────────────────────
    useEffect(() => {
        const savedSession = sessionStorage.getItem('campus_visitor_session');
        let currentVisitor = { name: '', mobile: '', id: null };
        let currentOnboardingStep = 1;

        if (savedSession) {
            currentVisitor = JSON.parse(savedSession);
            setVisitor(currentVisitor);
            currentOnboardingStep = 0;
            setOnboardingStep(0);
        } else {
            setOnboardingStep(1);
        }

        const loadVoices = () => {
            voicesRef.current = synthRef.current.getVoices();

            // Initial greeting logic moved here to run once after voices are ready or session checked
            if (chatLog.length === 0) {
                if (currentOnboardingStep === 1) {
                    const greeting = `Hi! I'm ${name} 👋 Please enter or say your mobile number to get started.`;
                    setChatLog([{ role: 'assistant', content: greeting }]);
                    setTimeout(() => speak(greeting, gender), 600);
                } else if (currentOnboardingStep === 2) {
                    const greeting = "Thank you. Now, please enter your email address to receive your chat report.";
                    setChatLog([{ role: 'assistant', content: greeting }]);
                    setTimeout(() => speak(greeting, gender), 600);
                } else if (currentOnboardingStep === 3) {
                    const greeting = "Great! Finally, what is your full name?";
                    setChatLog([{ role: 'assistant', content: greeting }]);
                    setTimeout(() => speak(greeting, gender), 600);
                } else {
                    const firstName = currentVisitor.name ? currentVisitor.name.split(' ')[0] : 'there';
                    const greeting = `Welcome back, ${firstName}! How can I help you today?`;
                    setChatLog([{ role: 'assistant', content: greeting }]);
                    setTimeout(() => speak(greeting, gender), 600);
                }
            }
        };

        loadVoices();
        synthRef.current.onvoiceschanged = loadVoices;
        return () => { synthRef.current.onvoiceschanged = null; };
    }, [gender, speak]);

    // ── Start listening ──────────────────────────────────────────────────────
    const startListening = useCallback(async () => {
        if (isListening) return;
        transcriptRef.current = '';
        setTranscript('');
        setStatusText('Listening...');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioChunksRef.current = [];
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.start();
        } catch (err) {
            console.warn('Microphone access denied:', err);
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            toast.error('Speech recognition not supported. Please use Chrome.');
            return;
        }
        const recog = new SR();
        recog.lang = 'en-IN';
        recog.continuous = true;
        recog.interimResults = true;

        recog.onresult = (event) => {
            let final = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
            }
            if (final) {
                transcriptRef.current = final;
                setTranscript(final);
            }
        };
        recog.onerror = () => { setIsListening(false); setStatusText('Tap the mic to speak'); };
        recog.onend = () => { setIsListening(false); };

        recognitionRef.current = recog;
        recog.start();
        setIsListening(true);
    }, [isListening]);

    // ── Stop listening & process ──────────────────────────────────────────────
    const stopListening = useCallback(async () => {
        setIsListening(false);
        setStatusText('Thinking...');

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { }
        }

        let audioBlob = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            await new Promise((resolve) => {
                mediaRecorderRef.current.onstop = () => {
                    audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    resolve();
                };
                mediaRecorderRef.current.stop();
            });
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        const question = transcriptRef.current.trim();
        if (!question) {
            setStatusText('No speech detected. Try again.');
            return;
        }

        const currentStep = onboardingStep;
        setChatLog(prev => [...prev, { role: 'user', content: currentStep === 1 ? maskMobile(question) : question }]);

        if (currentStep === 1) {
            const mobile = question.replace(/\D/g, "");
            if (mobile.length !== 10) {
                const retryMsg = "That doesn't look like a 10-digit number. Please say it again clearly.";
                setChatLog(prev => [...prev, { role: 'assistant', content: retryMsg }]);
                speak(retryMsg, gender);
                return;
            }

            setStatusText('Checking identity...');
            try {
                const existing = await lookupVisitor(mobile);
                setVisitor(existing);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(existing));
                
                // If existing visitor has no email, ask for it
                if (!existing.email) {
                    setOnboardingStep(2);
                    const emailMsg = `Welcome back, ${existing.name}! We need your email address to send you the chat reports. What is your email?`;
                    setChatLog(prev => [...prev, { role: 'assistant', content: emailMsg }]);
                    speak(emailMsg, gender);
                } else {
                    setOnboardingStep(0);
                    const welcomeMsg = `Welcome back, ${existing.name}! 😊 How can I assist you today?`;
                    setChatLog(prev => [...prev, { role: 'assistant', content: welcomeMsg }]);
                    speak(welcomeMsg, gender);
                }
            } catch (err) {
                setVisitor(prev => ({ ...prev, mobile }));
                setOnboardingStep(2); // NEW: Always go to Step 2 (Email) first for new visitors
                const emailMsg = "I don't think we've met! May I have your email address first so I can send you the chat transcript?";
                setChatLog(prev => [...prev, { role: 'assistant', content: emailMsg }]);
                speak(emailMsg, gender);
            }
            return;
        }

        if (currentStep === 2) {
            const email = question.toLowerCase().trim().replace(/\s/g, "");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            // Standard validation
            if (!emailRegex.test(email)) {
                const retryMsg = "That doesn't look like a valid email address. Please say it again clearly or type it out.";
                setChatLog(prev => [...prev, { role: 'assistant', content: retryMsg }]);
                speak(retryMsg, gender);
                return;
            }

            setVisitor(prev => ({ ...prev, email }));
            
            // If the visitor already has a name (from a lookup), we skip to chat
            if (visitor.name) {
                setOnboardingStep(0);
                const welcomeMsg = `Thank you! I've updated your email. How can I help you today?`;
                setChatLog(prev => [...prev, { role: 'assistant', content: welcomeMsg }]);
                speak(welcomeMsg, gender);
            } else {
                // Otherwise, move to Step 3 (Name)
                setOnboardingStep(3);
                const nameMsg = "Perfect! Finally, what is your full name?";
                setChatLog(prev => [...prev, { role: 'assistant', content: nameMsg }]);
                speak(nameMsg, gender);
            }
            return;
        }

        if (currentStep === 3) {
            setStatusText('Registering...');
            try {
                // Ensure email is passed
                if (!visitor.email) {
                    setOnboardingStep(2);
                    const emailMsg = "Wait, I still need your email address first. What is it?";
                    setChatLog(prev => [...prev, { role: 'assistant', content: emailMsg }]);
                    speak(emailMsg, gender);
                    return;
                }

                const visitorData = { name: question, mobile: visitor.mobile, email: visitor.email };
                const registered = await registerVisitor(visitorData);
                const updated = { ...visitorData, id: registered.id };
                setVisitor(updated);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(updated));
                setOnboardingStep(0);
                const startMsg = `Great to meet you, ${question}! What can I tell you about the campus?`;
                setChatLog(prev => [...prev, { role: 'assistant', content: startMsg }]);
                speak(startMsg, gender);
            } catch (err) {
                console.error("Registration failed:", err);
                const errMsg = "I had trouble saving your details. Could you tell me your name again?";
                setChatLog(prev => [...prev, { role: 'assistant', content: errMsg }]);
                speak(errMsg, gender);
            }
            return;
        }

        let answer = '';
        try {
            const res = await ragChat(question, visitor.id);
            answer = res.answer || 'I could not find a relevant answer. Please try again.';
        } catch {
            answer = 'Connection error. Please make sure the backend is running.';
        }

        setChatLog(prev => [...prev, { role: 'assistant', content: answer }]);
        setStatusText('Zhara is speaking...');
        speak(answer, gender);

        if (audioBlob && visitor.id) {
            try {
                const fd = new FormData();
                fd.append('audio', audioBlob, 'voice.webm');
                fd.append('question_text', question);
                fd.append('answer_text', answer);
                fd.append('visitor_id', visitor.id);
                await saveAudio(fd);
            } catch (err) {
                console.warn('Audio save failed:', err);
            }
        }
    }, [gender, speak, onboardingStep, visitor]);

    const handleEndSession = async () => {
        if (!visitor.id) {
            toast.error("No active session found.");
            return;
        }

        setIsEndingSession(true);
        const loadingToast = toast.loading("Generating report and sending email...");

        try {
            const { endSession: endSessionApi } = await import('../services/api.service');
            await endSessionApi(visitor.id);

            toast.success("Report sent to your email successfully! ✅", { id: loadingToast });
            speak("Your conversation report has been sent to your email. Thank you for visiting!", gender);

            // Clear session
            sessionStorage.removeItem('campus_visitor_session');
            setVisitor({ name: '', mobile: '', email: '', id: null });
            setOnboardingStep(1);
            setChatLog([]);
        } catch (error) {
            console.error("End session error:", error);
            toast.error(error.response?.data?.error || "Failed to send report. Please check if your email is valid.", { id: loadingToast });
        } finally {
            setIsEndingSession(false);
        }
    };

    const toggleMute = useCallback(() => {
        if (!isMuted) synthRef.current.cancel();
        setIsMuted(prev => !prev);
    }, [isMuted]);

    // Sync with main navbar mute toggle
    useEffect(() => {
        const handleMuteToggle = (e) => {
            const newMuteState = e.detail;
            if (newMuteState && !isMuted) synthRef.current.cancel();
            setIsMuted(newMuteState);
        };
        window.addEventListener('zhara_mute_toggle', handleMuteToggle);
        return () => window.removeEventListener('zhara_mute_toggle', handleMuteToggle);
    }, [isMuted]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    useEffect(() => {
        return () => {
            synthRef.current.cancel();
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (_) { }
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f8] pt-24 relative overflow-hidden transition-all duration-700">
            {/* Immersive Backgrounds */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[160px] -z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[160px] -z-0 pointer-events-none"></div>

            {/* Main area */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-10 pt-12">

                {/* End Session Button - Top Right Floating */}
                {onboardingStep === 0 && visitor.id && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEndSession}
                        disabled={isEndingSession}
                        className="absolute top-4 right-10 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {isEndingSession ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <LogOut size={18} />
                        )}
                        {isEndingSession ? 'Sending...' : 'End Session'}
                    </motion.button>
                )}

                {/* ── Left: Premium Avatar Sidebar ── */}
                <div className="flex flex-col items-center py-12 px-8 lg:w-96 shrink-0 lg:ml-6 lg:mb-6 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {/* Avatar Display */}
                    <div className="relative mb-10 mt-8">
                        <AnimatePresence>
                            {(isSpeaking || isListening) && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-[-20%] rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-2xl"
                                />
                            )}
                        </AnimatePresence>

                        <div className={`relative p-2 rounded-full border-2 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 pb-4' : isListening ? 'border-red-500' : 'border-white/80'}`}>
                            <motion.img
                                src={gender === 'female' ? '/zhara-female.png' : '/zhara-male.png'}
                                alt="Zhara"
                                className="w-52 h-52 object-cover rounded-full shadow-2xl relative z-10"
                                animate={isSpeaking ? { y: [0, -5, 0], scale: [1, 1.02, 1] } : { y: 0, scale: 1 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>

                    <div className="text-center z-10">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">{name}</h2>
                        <div className="flex flex-col items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                                {gender === 'female' ? 'Female' : 'Male'} · AI Guide
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 font-black text-[8px] uppercase tracking-wider text-slate-800">
                                <Sparkles size={10} className="text-blue-600" />
                                AI Excellence
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-center items-center mb-10 px-6 py-5 mt-6 rounded-[2rem] bg-white/50 border border-white/80 shadow-inner">
                        <SoundBars
                            active={isSpeaking || isListening}
                            color={isListening ? '#ef4444' : '#2563eb'}
                        />
                    </div>

                    <div className="relative text-center mb-10 w-full px-4 h-20 flex items-center justify-center">
                        <motion.p
                            key={statusText}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-slate-500 text-sm font-bold italic leading-relaxed"
                        >
                            {isListening && transcript
                                ? <span className="text-blue-600 not-italic font-black italic">"{transcript}"</span>
                                : <span className="opacity-60">{statusText}</span>}
                        </motion.p>
                    </div>

                    <div className="relative mt-auto">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isListening ? stopListening : startListening}
                            disabled={isSpeaking}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all relative
                                ${isListening
                                    ? 'bg-red-500 text-white shadow-red-500/40'
                                    : isSpeaking
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200'
                                        : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-600/30 hover:shadow-blue-600/50'
                                }`}
                        >
                            {isListening ? (
                                <>
                                    <motion.div className="absolute inset-0 rounded-full bg-red-400/40" animate={{ scale: [1, 1.8], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
                                    <MicOff size={32} className="relative z-10" />
                                </>
                            ) : (
                                <Mic size={32} className="relative z-10" />
                            )}
                        </motion.button>
                        <p className={`text-center mt-5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors
                            ${isListening ? 'text-red-500' : 'text-slate-400'}`}>
                            {isListening ? 'Recording...' : isSpeaking ? 'Speaking...' : 'Push to Talk'}
                        </p>
                    </div>
                </div>

                {/* ── Right: Elevated Chat Log ── */}
                <div className="flex-1 overflow-y-auto px-8 py-2 pb-10 space-y-6 scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {chatLog.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-[85%] lg:max-w-[70%] rounded-[2rem] px-8 py-5 text-sm font-bold leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-[0_15px_40px_rgba(37,99,235,0.25)]'
                                        : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-700 rounded-tl-none shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                                    }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-blue-600 text-white scale-75">
                                                <Sparkles size={12} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 leading-none">AI Response</span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap text-base md:text-[15px]">{msg.content}</p>
                                    <div className={`mt-3 flex items-center gap-1 opacity-40 text-[9px] uppercase tracking-widest ${msg.role === 'user' ? 'justify-end text-white' : 'text-slate-400'}`}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>
            </div>
        </div>
    );
};

export default ZharaChat;
