import { 
    GraduationCap, LogOut, ArrowRight, Menu, X, Sparkles, Volume2, VolumeX,
    LayoutDashboard, Users, Activity, Database, Shield, Sun, Moon, BotMessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, NavLink, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { logout } from '../../services/api.service';
import useTheme from '../../hooks/useTheme';

const Navbar = ({ authenticated, setAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Dynamic state for ZharaChat and Admin integration
    const isZharaChat = location.pathname === '/zhara-chat';
    const isAdminPage = location.pathname === '/admin';
    const activeTab = searchParams.get('tab') || 'overview';
    
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        window.dispatchEvent(new CustomEvent('zhara_mute_toggle', { detail: !isMuted }));
    };

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

    const adminTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'avatars', label: 'Avatars', icon: Users },
        { id: 'visitors', label: 'Visitors', icon: Users },
        { id: 'activity', label: 'Activity Logs', icon: Activity },
        { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`w-full max-w-6xl px-6 py-3 flex items-center justify-between 
                rounded-full border transition-all duration-500 backdrop-blur-3xl
                ${isAdminPage 
                    ? 'bg-white/40 dark:bg-slate-900/40 border-indigo-200/20 shadow-[0_20px_60px_rgba(79,70,229,0.12)]' 
                    : 'bg-white/30 dark:bg-slate-900/30 border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.1)]'
                }`}
            >

                {/* 🔷 Brand / Logo */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br transition-all ${isAdminPage ? 'from-indigo-600 to-blue-600' : 'from-blue-600 to-violet-600'} shadow-lg`}>
                            <BotMessageSquare className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col text-slate-900 dark:text-white">
                            <span className="text-lg font-extrabold tracking-tight group-hover:text-blue-600 transition">
                                EchoBot
                            </span>
                            {isAdminPage && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500 leading-none mt-0.5 flex items-center"
                                >
                                    <Shield size={8} className="mr-1" /> Control Center
                                </motion.span>
                            )}
                        </div>
                    </Link>
                </div>

                {/* 🔹 Central Navigation */}
                <div className="flex-1 flex justify-center px-8">
                    {isAdminPage ? (
                        <div className="hidden md:flex items-center gap-2 bg-slate-900/5 p-1 rounded-full border border-black/5">
                            {adminTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2 ${
                                        activeTab === tab.id ? "text-white" : "text-slate-600 hover:text-black"
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="admin-pill"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full shadow-lg"
                                            transition={{ type: "spring", duration: 0.5 }}
                                        />
                                    )}
                                    <tab.icon size={16} className="relative z-10" />
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        !isZharaChat && (
                            <div className="hidden md:flex items-center gap-2 bg-slate-900/5 p-1 rounded-full border border-black/5">
                                {[
                                    { name: "Home", path: "/" },
                                    { name: "Chat Assistant", path: "/chat" },
                                    { name: "Voice Assistant", path: "/zhara" }
                                ].map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        end={item.path === "/"}
                                        className={({ isActive }) =>
                                            `relative px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                                                isActive ? "text-white" : "text-slate-600 hover:text-black"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-pill"
                                                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full shadow-lg"
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
                                                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                                                    : "text-slate-600 hover:text-black"
                                            }`
                                        }
                                    >
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        )
                    )}
                </div>

                {/* 🔸 Right Section */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-white/10 text-slate-800 dark:text-yellow-400 hover:bg-white/60 dark:hover:bg-slate-800/60 transition shadow-lg backdrop-blur-md"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </motion.button>

                    {isZharaChat && (
                        <div className="flex items-center gap-2 mr-2">
                             <button onClick={toggleMute} className="p-2.5 rounded-full bg-white/20 border border-white/20 text-slate-600 hover:text-blue-600 transition shadow-sm backdrop-blur-md">
                                {isMuted ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} />}
                            </button>
                            <button
                                onClick={() => { 
                                    toast("End session and return to home?", {
                                        action: { label: "End Session", onClick: () => { sessionStorage.removeItem('campus_visitor_session'); navigate('/zhara'); } }
                                    });
                                }}
                                className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-full bg-white/40 border border-white/30 text-slate-900 hover:text-red-600 transition font-bold text-sm shadow-sm backdrop-blur-md"
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
                                className="p-2.5 rounded-full bg-white/40 border border-white/30 text-slate-800 hover:text-red-600 hover:bg-red-50 transition shadow-lg backdrop-blur-md"
                            >
                                <LogOut size={18} />
                            </motion.button>
                        ) : (
                            <Link to="/login" className="hidden sm:block">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative px-6 py-2.5 rounded-full text-white font-semibold 
                                    bg-gradient-to-r from-blue-600 to-violet-600 shadow-xl"
                                >
                                    <span className="relative flex items-center gap-2">
                                        Try Admin <ArrowRight size={16} />
                                    </span>
                                </motion.button>
                            </Link>
                        )
                    )}

                    {!isZharaChat && (
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2.5 rounded-full bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md">
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-24 left-4 right-4 z-40 p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/30 dark:border-white/10 shadow-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            {isAdminPage ? (
                                adminTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            handleTabChange(tab.id);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${
                                            activeTab === tab.id 
                                                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl" 
                                                : "bg-white/20 dark:bg-slate-800/20 text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"
                                        }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))
                            ) : (
                                [
                                    { name: "Home", path: "/", icon: <Sparkles size={18} /> },
                                    { name: "AI Assistant", path: "/chat", icon: <GraduationCap size={18} /> },
                                    { name: "🎤 Zhara", path: "/zhara", icon: <Volume2 size={18} /> }
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold
                                            ${location.pathname === item.path ? "bg-blue-600 text-white shadow-xl" : "bg-white/20 dark:bg-slate-800/20 text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"}`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;