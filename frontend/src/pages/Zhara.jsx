import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Avatar Selection Screen Sub-component ─────────────────────────────────────
const AvatarCard = ({ gender, label, desc, onClick, selected }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(gender)}
        className={`relative flex flex-col items-center gap-5 p-8 rounded-[2.5rem] border transition-all cursor-pointer w-72 group
            ${selected === gender
                ? 'border-violet-500/50 shadow-[0_20px_50px_rgba(124,58,237,0.3)] bg-white/80 backdrop-blur-xl'
                : 'border-white/40 bg-white/40 backdrop-blur-md hover:border-violet-400/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]'}`}
    >
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
            <img
                src={gender === 'female' ? '/zhara-female.png' : '/zhara-male.png'}
                alt={label}
                className="w-48 h-48 object-cover rounded-3xl shadow-2xl transition-transform group-hover:scale-105 duration-500"
            />
            {selected === gender && (
                <motion.div
                    layoutId="selection-glow"
                    className="absolute -inset-4 bg-violet-500/20 blur-2xl rounded-full -z-10"
                />
            )}
        </div>

        <div className="text-center relative z-10">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{label}</p>
            <p className="text-sm text-slate-500 font-medium mt-2 opacity-80">{desc}</p>
        </div>

        <div className={`mt-4 px-6 py-2 rounded-full text-xs font-bold transition-all
            ${selected === gender 
                ? 'bg-violet-600 text-white shadow-lg' 
                : 'bg-slate-200/50 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
            {selected === gender ? 'Selected' : 'Choose Avatar'}
        </div>
    </motion.button>
);

const Zhara = () => {
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState({ name: '', mobile: '', id: null });

    // ── Load session ──────────────────────────────────────────────────────────
    useEffect(() => {
        const savedSession = sessionStorage.getItem('campus_visitor_session');
        if (savedSession) {
            setVisitor(JSON.parse(savedSession));
        }
    }, []);

    // ── Enter chat screen ─────────────────────────────────────────────────────
    const enterChat = useCallback((selectedGender) => {
        navigate(`/zhara-chat?gender=${selectedGender}`);
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4 pt-44 pb-12 relative overflow-hidden">
            {/* Immersive Animated Background Layers */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[180px] pointer-events-none"></div>
            
            {/* Floating Particles/Elements */}
            <div className="absolute top-[20%] right-[15%] w-4 h-4 rounded-full bg-blue-400/20 blur-sm animate-bounce" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-[30%] left-[10%] w-6 h-6 rounded-full bg-violet-400/20 blur-sm animate-bounce" style={{ animationDuration: '6s' }}></div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14 relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                    <Sparkles size={12} /> Welcome, {visitor.name ? visitor.name.split(' ')[0] : 'to Campus AI'}!
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-4">
                    Meet{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent italic">
                        Avatar
                    </span>
                </h1>
                <p className="text-slate-400 text-lg font-bold max-w-md mx-auto leading-relaxed">
                    Choose your preferred voice avatar to begin your conversational journey.
                </p>
            </motion.div>

            {/* Avatar Cards */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-10 items-center justify-center relative z-10"
            >
                <AvatarCard
                    gender="female"
                    label="Zhara (Female)"
                    desc="Warm · Friendly · Empathetic"
                    onClick={enterChat}
                />
                <AvatarCard
                    gender="male"
                    label="Zaid (Male)"
                    desc="Clear · Confident · Authoritative"
                    onClick={enterChat}
                />
            </motion.div>

            {/* Footer Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex flex-col items-center gap-3 relative z-10"
            >
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                    ✦ Optimized for Google Chrome ✦
                </p>
            </motion.div>
        </div>
    );
};

export default Zhara;
