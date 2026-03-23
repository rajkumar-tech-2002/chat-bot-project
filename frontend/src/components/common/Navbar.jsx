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

                {/* 🔹 Nav Links */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100/60 p-1 rounded-full">

                    {[
                        { name: "Home", path: "/" },
                        { name: "AI Assistant", path: "/chat" }
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

                {/* 🔸 Right Section */}
                <div className="flex items-center gap-3">
                    {authenticated ? (
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
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative px-6 py-2.5 rounded-full text-white font-semibold 
                                bg-gradient-to-r from-blue-600 to-violet-600 
                                overflow-hidden"
                            >
                                {/* Glow Effect */}
                                <span className="absolute inset-0 bg-white/10 blur-xl opacity-0 hover:opacity-100 transition"></span>

                                <span className="relative flex items-center gap-2">
                                    Try Admin
                                    <ArrowRight size={16} />
                                </span>
                            </motion.button>
                        </Link>
                    )}
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;