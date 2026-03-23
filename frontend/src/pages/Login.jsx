import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.service';

const Login = ({ setAuthenticated }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(userId, password);
            if (data.user_id) {
                setAuthenticated(true);
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid administrative credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 pt-32 relative">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(30,58,138,0.15)] relative overflow-hidden group"
            >
                {/* Internal Card Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/5 to-violet-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex flex-col items-center mb-10 relative">
                    <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="p-5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl mb-6 shadow-2xl shadow-blue-600/30"
                    >
                        <Lock className="text-white" size={32} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Gateway</h1>
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-3"></div>
                    <p className="text-slate-500 font-semibold text-sm mt-3">Authorized access to Knowledge Base</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Identity</label>
                        <div className="group/input relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" size={20} />
                            <input
                                required
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full bg-slate-100/50 border border-transparent rounded-[1.25rem] py-4 pl-12 pr-4 focus:outline-none focus:bg-white focus:border-blue-200 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-inner"
                                placeholder="Admin Identification"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Security Key</label>
                        <div className="group/input relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-violet-600 transition-colors" size={20} />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-100/50 border border-transparent rounded-[1.25rem] py-4 pl-12 pr-4 focus:outline-none focus:bg-white focus:border-violet-200 transition-all text-slate-900 placeholder-slate-400 font-bold shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center space-x-2 text-red-600"
                        >
                            <span className="text-sm font-bold">{error}</span>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black py-4 rounded-[1.25rem] shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3 transition-all disabled:opacity-40"
                    >
                        {isLoading ? (
                            <Loader className="animate-spin" size={24} />
                        ) : (
                            <>
                                <span>Aquire Access</span>
                                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>
                
                <p className="mt-10 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                    Protected by end-to-end academic grade encryption<br/>Restricted to authorized personnel only
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
