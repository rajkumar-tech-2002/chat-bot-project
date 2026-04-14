import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAvatars } from '../services/api.service';

const BACKEND_URL = 'http://localhost:3000';

// ── Avatar Card Sub-component ─────────────────────────────────────────────────
const AvatarCard = ({ avatar, onClick, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(avatar)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex flex-col items-center gap-5 p-8 rounded-[2.5rem] border transition-all cursor-pointer w-72 group
                ${selected?.id === avatar.id
                    ? 'border-violet-500/50 dark:border-violet-400/50 shadow-[0_20px_50px_rgba(124,58,237,0.3)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'
                    : 'border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:border-violet-400/50 dark:hover:border-violet-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] shadow-sm'}`}
        >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Gender Tint Overlay */}
            <div className={`absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity
                ${avatar.gender === 'female'
                    ? 'bg-gradient-to-b from-pink-500/5 to-violet-500/5'
                    : 'bg-gradient-to-b from-blue-500/5 to-cyan-500/5'}`} />

            <div className="relative w-48 h-48 rounded-3xl shadow-2xl mb-4">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <AnimatePresence>
                        {isHovered && avatar.greeting_video_url ? (
                            <motion.video
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={`${BACKEND_URL}${avatar.greeting_video_url}`}
                                autoPlay
                                muted
                                loop
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <motion.img
                                key="image"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={`${BACKEND_URL}${avatar.image_url}`}
                                alt={avatar.name}
                                className="absolute inset-0 w-full h-full object-cover dark:opacity-90"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=7c3aed&color=fff&size=256&font-size=0.4`;
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {selected?.id === avatar.id && (
                    <motion.div
                        layoutId="selection-glow"
                        className="absolute -inset-4 bg-violet-500/20 blur-2xl rounded-full -z-10"
                    />
                )}
                {/* Gender Badge */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-20
                    ${avatar.gender === 'female'
                        ? 'bg-pink-500 text-white'
                        : 'bg-blue-500 text-white'}`}>
                    {avatar.gender === 'female' ? '♀ Female' : '♂ Male'}
                </div>
            </div>

            <div className="text-center relative z-10 mt-2">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-500">{avatar.name}</p>
                {avatar.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 opacity-80 transition-colors duration-500">
                        {avatar.description}
                    </p>
                )}
            </div>

            <div className={`mt-4 px-6 py-2 rounded-full text-xs font-bold transition-all
                ${selected?.id === avatar.id
                    ? 'bg-violet-600 dark:bg-violet-500 text-white shadow-lg'
                    : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                {selected?.id === avatar.id ? 'Selected ✓' : 'Choose Avatar'}
            </div>
        </motion.button>
    );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const AvatarSkeleton = () => (
    <div className="w-72 h-96 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-white/10 backdrop-blur-md animate-pulse flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-48 h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-24 rounded-lg bg-slate-100 dark:bg-slate-700" />
    </div>
);

// ── Main Zhara Page ───────────────────────────────────────────────────────────
const Zhara = () => {
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState({ name: '', mobile: '', id: null });
    const [avatars, setAvatars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    // Load session
    useEffect(() => {
        const savedSession = sessionStorage.getItem('campus_visitor_session');
        if (savedSession) {
            setVisitor(JSON.parse(savedSession));
        }
    }, []);

    // Fetch avatars dynamically from API
    useEffect(() => {
        const fetchAvatars = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAvatars();
                setAvatars(data.avatars || []);
            } catch (err) {
                console.error('Failed to fetch avatars:', err);
                setError('Could not load avatars. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAvatars();
    }, []);

    // Navigate to chat with avatar info
    const enterChat = useCallback((avatar) => {
        setSelected(avatar);
        // Pass avatar id, gender, name, image URL and speaking video URL via query params
        const params = new URLSearchParams({
            gender: avatar.gender,
            avatar_id: avatar.id,
            avatar_name: avatar.name,
            avatar_image: avatar.image_url,
            speaking_video: avatar.speaking_video_url || ''
        });
        navigate(`/zhara-chat?${params.toString()}`);
    }, [navigate]);


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-slate-950 px-4 pt-44 pb-12 relative overflow-hidden transition-colors duration-500">
            {/* Immersive Animated Background Layers */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-violet-500/10 dark:bg-violet-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[180px] pointer-events-none" />

            {/* Floating Particles */}
            <div className="absolute top-[20%] right-[15%] w-4 h-4 rounded-full bg-blue-400/20 blur-sm animate-bounce" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[30%] left-[10%] w-6 h-6 rounded-full bg-violet-400/20 blur-sm animate-bounce" style={{ animationDuration: '6s' }} />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14 relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                    <Sparkles size={12} /> Welcome, {visitor.name ? visitor.name.split(' ')[0] : 'to Campus AI'}!
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-4 transition-colors duration-500">
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
                className="flex flex-wrap gap-10 items-center justify-center relative z-10"
            >
                {loading ? (
                    // Skeleton loaders
                    <><AvatarSkeleton /><AvatarSkeleton /></>
                ) : error ? (
                    // Error state
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <AlertCircle size={40} className="text-red-400" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                        >
                            Retry
                        </button>
                    </div>
                ) : avatars.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Loader size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                            No avatars available yet.
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">
                            Please check back later or contact admin.
                        </p>
                    </div>
                ) : (
                    // Dynamic avatar cards
                    <AnimatePresence>
                        {avatars.map((avatar) => (
                            <AvatarCard
                                key={avatar.id}
                                avatar={avatar}
                                onClick={enterChat}
                                selected={selected}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* Footer Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 flex flex-col items-center gap-3 relative z-10"
            >
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase">
                    ✦ Optimized for Google Chrome ✦
                </p>
            </motion.div>
        </div>
    );
};

export default Zhara;
