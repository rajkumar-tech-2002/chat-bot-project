import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft, Sparkles, GraduationCap, LogOut, Delete } from 'lucide-react';
import { ragChat, saveAudio, lookupVisitor, registerVisitor } from '../services/api.service';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = 'http://localhost:3000';

const ZharaChat = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const gender = searchParams.get('gender') || 'female';
    const avatarName = searchParams.get('avatar_name')
        ? decodeURIComponent(searchParams.get('avatar_name'))
        : (gender === 'female' ? 'Zhara' : 'Zaid');
    const avatarImageUrl = searchParams.get('avatar_image') || '';
    const avatarSrc = avatarImageUrl.startsWith('/uploads/')
        ? `${BACKEND_URL}${avatarImageUrl}`
        : avatarImageUrl;

    const speakingVideoUrl = searchParams.get('speaking_video')
        ? (searchParams.get('speaking_video').startsWith('/uploads/')
            ? `${BACKEND_URL}${searchParams.get('speaking_video')}`
            : searchParams.get('speaking_video'))
        : null;


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
    const [isMinimized, setIsMinimized] = useState(false);

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
    const baselineRef = useRef('');
    const isRestartingRef = useRef(false);

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

            // If session_id is missing (old session), generate it now
            if (!currentVisitor.session_id) {
                currentVisitor.session_id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substr(2);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(currentVisitor));
            }

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
                    const greeting = `Hi! I'm ${avatarName} 👋 Please enter or say your mobile number to get started.`;

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
                } else if (currentOnboardingStep === 4) {
                    const greeting = `Welcome back, ${currentVisitor.name}! I have your email as ${currentVisitor.email}. Do you want to change your email address?`;
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
    const startListening = useCallback(async (preserveExisting = false) => {
        if (isListening && !isRestartingRef.current) return;
        if (!preserveExisting) {
            transcriptRef.current = '';
            baselineRef.current = '';
            setTranscript('');
        } else {
            baselineRef.current = transcriptRef.current;
        }
        setIsListening(true);
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
                const updated = (baselineRef.current + ' ' + final).trim();
                transcriptRef.current = updated;
                setTranscript(updated);
            }
        };
        recog.onerror = () => { if (!isRestartingRef.current) setIsListening(false); setStatusText('Tap the mic to speak'); };
        recog.onend = () => {
            if (isRestartingRef.current) {
                isRestartingRef.current = false;
                try { recog.start(); } catch (_) { setIsListening(false); }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recog;
        recog.start();
        setIsListening(true);
    }, [isListening]);

    // ── Stop listening & process ──────────────────────────────────────────────
    const stopListening = useCallback(async (shouldProcess = true) => {
        setIsListening(false);
        if (shouldProcess) {
            setStatusText('Thinking...');
        } else {
            setStatusText('Paused');
        }

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

        if (!shouldProcess) return;

        const question = transcriptRef.current.trim();
        if (!question) {
            setStatusText('No speech detected. Try again.');
            return;
        }

        const currentStep = onboardingStep;
        setChatLog(prev => [...prev, { role: 'user', content: currentStep === 1 ? maskMobile(question) : question }]);

        // Clear transcript for the next turn IMMEDIATELY after capturing it
        transcriptRef.current = '';
        baselineRef.current = '';
        setTranscript('');

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
                const session_id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substr(2);
                const visitorWithSession = { ...existing, session_id };
                setVisitor(visitorWithSession);
                sessionStorage.setItem('campus_visitor_session', JSON.stringify(visitorWithSession));

                // If existing visitor has no email, ask for it
                if (!existing.email) {
                    setOnboardingStep(2);
                    const emailMsg = `Welcome back, ${existing.name}! We need your email address to send you the chat reports. What is your email?`;
                    setChatLog(prev => [...prev, { role: 'assistant', content: emailMsg }]);
                    speak(emailMsg, gender);
                } else {
                    setOnboardingStep(4);
                    const welcomeMsg = `Welcome back, ${existing.name}! I have your email as ${existing.email}. Do you want to change your email address?`;
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
                setStatusText('Updating...');
                try {
                    const { updateVisitorEmail } = await import('../services/api.service');
                    await updateVisitorEmail(visitor.id, email);
                    setOnboardingStep(0);
                    const welcomeMsg = `Thank you! I've updated your email to ${email}. How can I help you today?`;
                    setChatLog(prev => [...prev, { role: 'assistant', content: welcomeMsg }]);
                    speak(welcomeMsg, gender);
                } catch (err) {
                    setOnboardingStep(0);
                    speak("No problem. How can I help you?", gender);
                }
            } else {
                // Otherwise, move to Step 3 (Name)
                setOnboardingStep(3);
                const nameMsg = "Perfect! Finally, what is your full name?";
                setChatLog(prev => [...prev, { role: 'assistant', content: nameMsg }]);
                speak(nameMsg, gender);
            }
            return;
        }

        if (currentStep === 4) {
            const text = question.toLowerCase().trim();
            const isAffirmative = ["yes", "yep", "sure", "correct", "y", "ok"].some(word => text === word || text.startsWith(word + " "));
            const isNegative = ["no", "nope", "n", "don't change", "negative", "use old"].some(word => text === word || text.startsWith(word + " "));

            if (isAffirmative) {
                setOnboardingStep(2);
                const msg = "Please tell me or type your new email address.";
                setChatLog(prev => [...prev, { role: 'assistant', content: msg }]);
                speak(msg, gender);
            } else if (isNegative) {
                setOnboardingStep(0);
                const msg = `Great! How can I assist you today?`;
                setChatLog(prev => [...prev, { role: 'assistant', content: msg }]);
                speak(msg, gender);
            } else {
                // Fallback: check if it's a new email anyway
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const words = text.split(/\s+/);
                const newEmail = words.find(w => emailRegex.test(w));

                if (newEmail) {
                    setStatusText('Updating...');
                    try {
                        const { updateVisitorEmail } = await import('../services/api.service');
                        await updateVisitorEmail(visitor.id, newEmail);
                        setVisitor(prev => ({ ...prev, email: newEmail }));
                        setOnboardingStep(0);
                        const msg = `Perfect! I've updated your email to ${newEmail}. How can I help you today?`;
                        setChatLog(prev => [...prev, { role: 'assistant', content: msg }]);
                        speak(msg, gender);
                    } catch (err) {
                        setOnboardingStep(0);
                    }
                } else {
                    const retryMsg = "I didn't quite get that. Do you want to change your saved email? (Say 'Yes' or 'No')";
                    setChatLog(prev => [...prev, { role: 'assistant', content: retryMsg }]);
                    speak(retryMsg, gender);
                }
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

                const session_id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substr(2);
                const visitorData = { name: question, mobile: visitor.mobile, email: visitor.email };
                const registered = await registerVisitor(visitorData);
                const updated = { ...visitorData, id: registered.id, session_id };
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
            const res = await ragChat(question, visitor.id, visitor.session_id);
            answer = res.answer || 'I could not find a relevant answer. Please try again.';
        } catch {
            answer = 'Connection error. Please make sure the backend is running.';
        }

        setChatLog(prev => [...prev, { role: 'assistant', content: answer }]);
        setStatusText(`${avatarName} is speaking...`);
        speak(answer, gender);


        if (audioBlob && visitor.id) {
            try {
                const fd = new FormData();
                fd.append('audio', audioBlob, 'voice.webm');
                fd.append('question_text', question);
                fd.append('answer_text', answer);
                fd.append('visitor_id', visitor.id);
                fd.append('session_id', visitor.session_id);
                await saveAudio(fd);
            } catch (err) {
                console.warn('Audio save failed:', err);
            }
        }

    }, [gender, speak, onboardingStep, visitor]);

    const handleTranscriptBackspace = useCallback(() => {
        setTranscript(prev => {
            const updated = prev.slice(0, -1);
            transcriptRef.current = updated;
            baselineRef.current = updated;
            return updated;
        });

        if (isListening && recognitionRef.current) {
            isRestartingRef.current = true;
            try { recognitionRef.current.stop(); } catch (_) { isRestartingRef.current = false; }
        }
    }, [isListening]);

    const handleTranscriptChange = useCallback((e) => {
        const val = e.target.value;
        setTranscript(val);
        transcriptRef.current = val;
        baselineRef.current = val;

        if (isListening && recognitionRef.current) {
            isRestartingRef.current = true;
            try { recognitionRef.current.stop(); } catch (_) { isRestartingRef.current = false; }
        }
    }, [isListening]);

    const handleEndSession = async () => {
        if (!visitor.id) {
            toast.error("No active session found.");
            return;
        }

        setIsEndingSession(true);
        const loadingToast = toast.loading("Generating report and sending email...");

        try {
            const { endSession: endSessionApi } = await import('../services/api.service');
            await endSessionApi(visitor.id, visitor.session_id);

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
        <div className="min-h-screen flex flex-col bg-[#f0f4f8] dark:bg-slate-950 pt-24 relative overflow-hidden transition-all duration-700">
            {/* Immersive Backgrounds */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[160px] -z-0 pointer-events-none transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 dark:bg-violet-600/10 rounded-full blur-[160px] -z-0 pointer-events-none transition-colors duration-700"></div>

            {/* Main area */}
            <div className="flex flex-col flex-1 overflow-hidden relative z-10 pt-4">



                {/* ── Chat Content ── */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-2 pt-42 pb-32 space-y-6 scrollbar-hide max-w-5xl mx-auto w-full">
                    <AnimatePresence initial={false}>
                        {chatLog.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-[90%] lg:max-w-[75%] rounded-[2rem] px-6 md:px-8 py-4 md:py-5 text-sm font-bold leading-relaxed transition-all duration-500
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 text-white rounded-tr-none shadow-[0_15px_40px_rgba(37,99,235,0.25)]'
                                        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                                    }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white scale-75">
                                                <Sparkles size={12} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 leading-none">AI Response</span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap text-base md:text-[15px]">{msg.content}</p>
                                    <div className={`mt-3 flex items-center gap-1 opacity-40 text-[9px] uppercase tracking-widest ${msg.role === 'user' ? 'justify-end text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>

                {/* ── Floating Premium Controller ── */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        width: isMinimized ? '110px' : '360px',
                        height: isMinimized ? '110px' : 'auto'
                    }}
                    className="fixed bottom-8 right-8 z-[100] flex flex-col items-center p-6 rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden group transition-all duration-500"
                >
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                    {/* Minimize/Maximize Toggle */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <motion.div animate={{ rotate: isMinimized ? 0 : 180 }}>
                            <Volume2 size={14} className="text-slate-600 dark:text-slate-300" />
                        </motion.div>
                    </button>

                    <div className={`flex flex-col items-center transition-all duration-500 ${isMinimized ? 'scale-75 opacity-70 translate-y-2' : 'scale-100 opacity-100'}`}>
                        {/* Avatar Display */}
                        <div className={`relative ${isMinimized ? 'mb-0' : 'mb-6 mt-4'}`}>
                            <AnimatePresence>
                                {(isSpeaking || isListening) && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-[-20%] rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-400/30 dark:to-violet-400/30 blur-2xl"
                                    />
                                )}
                            </AnimatePresence>

                            <div className={`relative ${isMinimized ? 'w-16 h-16' : 'w-32 h-32'} p-1 rounded-full border-2 transition-all duration-500 overflow-hidden flex items-center justify-center ${isSpeaking ? 'border-blue-500' : isListening ? 'border-red-500' : 'border-white/80 dark:border-white/20'}`}>
                                <AnimatePresence>
                                    {isSpeaking && speakingVideoUrl ? (
                                        <motion.video
                                            key="speaking-video"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            src={speakingVideoUrl}
                                            autoPlay
                                            muted
                                            loop
                                            className="w-full h-full object-cover rounded-full absolute inset-0 z-10 dark:opacity-90"
                                        />
                                    ) : (
                                        <motion.img
                                            key="avatar-image"
                                            initial={{ opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            src={avatarSrc}
                                            alt={avatarName}
                                            className="w-full h-full object-cover rounded-full absolute inset-0 z-10 dark:opacity-90"
                                            animate={{
                                                opacity: 1,
                                                ...(isSpeaking ? { y: [0, -2, 0], scale: [1, 1.02, 1] } : { y: 0, scale: 1 })
                                            }}
                                            transition={{
                                                opacity: { duration: 0.4 },
                                                default: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <div className="text-center z-10 mb-4">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">{avatarName}</h2>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest">
                                        <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                        AI Guide
                                    </div>
                                </div>

                                <div className="relative text-center mb-6 w-full px-4 h-12 flex items-center justify-center gap-2">
                                    {isListening && transcript ? (
                                        <div className="flex items-center w-full group/input bg-white/10 dark:bg-slate-800/20 rounded-xl px-3 py-1.5 border border-white/20 dark:border-white/5 backdrop-blur-sm">
                                            <input
                                                type="text"
                                                value={transcript}
                                                onChange={handleTranscriptChange}
                                                className="flex-1 bg-transparent border-none outline-none text-blue-600 dark:text-blue-400 font-black italic text-sm text-center"
                                                placeholder="Say something..."
                                                autoFocus
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1, color: '#ef4444' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleTranscriptBackspace}
                                                className="p-1 text-slate-400 dark:text-slate-500 transition-colors"
                                                title="Backspace"
                                            >
                                                <Delete size={16} />
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <motion.p
                                            key={statusText}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-slate-500 dark:text-slate-400 text-xs font-bold italic leading-tight"
                                        >
                                            <span className="opacity-60">{statusText}</span>
                                        </motion.p>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 mb-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={isListening ? stopListening : () => startListening(transcript.length > 0)}
                                        disabled={isSpeaking}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all relative
                                            ${isListening
                                                ? 'bg-red-500 text-white shadow-red-500/40'
                                                : isSpeaking
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 text-white shadow-blue-600/30'
                                            }`}
                                    >
                                        {isListening ? (
                                            <>
                                                <motion.div className="absolute inset-0 rounded-full bg-red-400/40" animate={{ scale: [1, 1.8], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
                                                <MicOff size={24} className="relative z-10" />
                                            </>
                                        ) : (
                                            <Mic size={24} className="relative z-10" />
                                        )}
                                    </motion.button>

                                    {onboardingStep === 0 && visitor.id && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleEndSession}
                                            disabled={isEndingSession}
                                            className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10 border border-red-200 dark:border-red-800/50"
                                            title="End Session"
                                        >
                                            {isEndingSession ? (
                                                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <LogOut size={24} />
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                                <p className={`text-center mt-2 text-[8px] font-black uppercase tracking-[0.2em] transition-colors
                                    ${isListening ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {isListening ? 'Recording...' : isSpeaking ? 'Speaking...' : 'Push to Talk'}
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ZharaChat;
