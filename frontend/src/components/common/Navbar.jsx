import { NavLink, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { logout } from '../../services/api.service';

const Navbar = ({ authenticated, setAuthenticated }) => {
    const navigate = useNavigate();

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
        <div className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto max-w-7xl w-full bg-white/60 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-3 flex items-center justify-between shadow-xl shadow-black/5">
                {/* Logo Section */}
                <Link to="/">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 group cursor-pointer"
                    >
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg shadow-lg shadow-blue-600/20">
                            <GraduationCap className="text-white" size={20} />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                            Campus AI
                        </span>
                    </motion.div>
                </Link>

                {/* Navigation Links - Centered */}
                <div className="hidden lg:flex items-center space-x-1">
                    <NavLink 
                        to="/" 
                        end
                        className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        Home
                    </NavLink>
                    
                    <NavLink 
                        to="/chat" 
                        className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        AI Assistant
                    </NavLink>

                    {authenticated && (
                        <NavLink 
                            to="/admin" 
                            className={({ isActive }) => `px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                        >
                            Admin Dashboard
                        </NavLink>
                    )}
                </div>

                {/* Right Action Button */}
                <div className="flex items-center space-x-3">
                    {authenticated ? (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLogout}
                            className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full border border-slate-200 shadow-sm transition-all"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </motion.button>
                    ) : (
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(37,99,235,0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-black rounded-full shadow-lg shadow-blue-600/20 flex items-center space-x-2 border border-white/10 transition-all"
                            >
                                <span>Try Admin</span>
                                <ArrowRight size={16} />
                            </motion.button>
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
