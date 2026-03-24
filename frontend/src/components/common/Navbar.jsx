import { GraduationCap, LogOut, ArrowRight, Menu, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';
import { toast } from 'sonner';
import { logout } from '../../services/api.service';

const Navbar = ({ authenticated, setAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Dynamic state for ZharaChat integration
    const isZharaChat = location.pathname === '/zhara-chat';
    const [isMuted, setIsMuted] = useState(false);

    // Sync with session/window state if needed (basic mute toggle for demo)
    const toggleMute = () => {
        setIsMuted(prev => !prev);
        // Dispatch event or callback if needed for ZharaChat
        window.dispatchEvent(new CustomEvent('zhara_mute_toggle', { detail: !isMuted }));
    };

    // Close menu on navigation
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            setAuthenticated(false);
            navigate('/');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl px-6 py-3 flex items-center justify-between 
                rounded-full border border-white/20 
                bg-white/70 backdrop-blur-xl border-white/20 
                shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >

                {/* 🔷 Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                        Campus AI
                    </span>
                </Link>

                {/* 🔹 Nav Links (Hidden on ZharaChat desktop) */}
                {!isZharaChat && (
                    <div className="hidden md:flex items-center gap-2 bg-slate-100/60 p-1 rounded-full">

                        {[
                            { name: "Home", path: "/" },
                            { name: "AI Assistant", path: "/chat" },
                            { name: "🎤 Zhara", path: "/zhara" }
                        ].map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `relative px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                                        isActive
                                            ? "text-white"
                                            : "text-slate-600 hover:text-black"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"
                                                transition={{ type: "spring", duration: 0.5 }}
                                            />
                                        )}
                                        <span className="relative z-10">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {authenticated && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `px-5 py-2 text-sm font-semibold rounded-full transition ${
                                        isActive
                                            ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow"
                                            : "text-slate-600 hover:text-black"
                                    }`
                                }
                            >
                                Admin
                            </NavLink>
                        )}
                    </div>
                )}

                {/* 🔸 Right Section */}
                <div className="flex items-center gap-3">
                    {/* Integrated ZharaChat Controls */}
                    {isZharaChat && (
                        <div className="flex items-center gap-2 mr-2">
                             <button 
                                onClick={toggleMute} 
                                className="p-2.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-500 hover:text-blue-600 transition shadow-sm"
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} />}
                            </button>

                            <button
                                onClick={() => { 
                                    toast("End session and return to home?", {
                                        action: {
                                            label: "End Session",
                                            onClick: () => {
                                                sessionStorage.removeItem('campus_visitor_session');
                                                navigate('/zhara');
                                            }
                                        },
                                        cancel: {
                                            label: "Cancel",
                                            onClick: () => {}
                                        }
                                    });
                                }}
                                className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition shadow-sm font-bold text-sm"
                            >
                                <LogOut size={16} />
                                <span className="hidden md:inline">End Session</span>
                            </button>
                        </div>
                    )}

                    {!isZharaChat && (
                        authenticated ? (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-2.5 rounded-full bg-white border border-slate-200 
                                text-slate-500 hover:text-red-500 hover:bg-red-50 transition"
                            >
                                <LogOut size={18} />
                            </motion.button>
                        ) : (
                            <Link to="/login" className="hidden sm:block">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative px-6 py-2.5 rounded-full text-white font-semibold 
                                    bg-gradient-to-r from-blue-600 to-violet-600 
                                    overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-white/10 blur-xl opacity-0 hover:opacity-100 transition"></span>
                                    <span className="relative flex items-center gap-2">
                                        Try Admin
                                        <ArrowRight size={16} />
                                    </span>
                                </motion.button>
                            </Link>
                        )
                    )}

                    {/* 📱 Mobile Menu Toggle (Hidden on ZharaChat) */}
                    {!isZharaChat && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-white transition shadow-sm"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                </div>
            </motion.nav>

            {/* ── Mobile Menu Overlay ── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-24 left-4 right-4 z-40 p-6 rounded-3xl
                        bg-white/90 backdrop-blur-2xl border border-white/40
                        shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {[
                                { name: "Home", path: "/", icon: <Sparkles size={18} /> },
                                { name: "AI Assistant", path: "/chat", icon: <GraduationCap size={18} /> },
                                { name: "🎤 Zhara", path: "/zhara", icon: <Volume2 size={18} /> }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold
                                        ${location.pathname === item.path 
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                                >
                                    <div className={`${location.pathname === item.path ? "text-white" : "text-blue-600"}`}>
                                        {item.icon}
                                    </div>
                                    {item.name}
                                </Link>
                            ))}
                            
                            {authenticated && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all font-bold"
                                >
                                    <div className="text-blue-600">
                                        <GraduationCap size={18} />
                                    </div>
                                    Admin Dashboard
                                </Link>
                            )}

                            {/* ZharaChat Mobile Controls */}
                            {isZharaChat && (
                                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            toggleMute();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold"
                                    >
                                        {isMuted ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} className="text-blue-600" />}
                                        {isMuted ? 'Unmute Voice' : 'Mute Voice'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if(window.confirm("End session?")) {
                                                sessionStorage.removeItem('campus_visitor_session');
                                                navigate('/zhara');
                                            }
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 font-bold"
                                    >
                                        <LogOut size={18} />
                                        End Session
                                    </button>
                                </div>
                            )}

                            {!authenticated && (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 p-4 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold"
                                >
                                    Try Admin <ArrowRight size={18} />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;