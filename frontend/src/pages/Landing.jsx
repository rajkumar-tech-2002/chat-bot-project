import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, GraduationCap, Building2, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLottie } from 'lottie-react';
import robotAnimation from '../assets/robot.json';
import VoiceVisualizer from '../components/VoiceVisualizer';
import LineWave from '../components/LineWave';

const Landing = () => {
    const LottieView = () => {
        const options = {
            animationData: robotAnimation,
            loop: true,
            autoplay: true,
        };
        const { View } = useLottie(options);
        return <div className="w-full h-full flex items-center justify-center scale-125">{View}</div>;
    };

    const features = [
        { icon: <Building2 className="text-blue-500" />, title: "Campus Info", desc: "Get instant details about courses, fees, and campus facilities." },
        { icon: <Users className="text-emerald-500" />, title: "Student Community", desc: "Connect with our AI-powered student support system for any queries." },
        { icon: <BookOpen className="text-purple-500" />, title: "Academic Resources", desc: "Access comprehensive data on curriculum and hostel details." }
    ];

    return (
        <div className="flex-1 pt-36 overflow-y-auto overflow-x-hidden">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <VoiceVisualizer />
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-slate-900">
                        Welcome to <br />
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Campus AI Portal</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        Your intelligent partner for navigating college life. Access course info, admissions details, and hostel data through our premium AI assistant.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/chat">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(37,99,235,0.25)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl font-black flex items-center justify-center space-x-3 shadow-2xl transition-all"
                            >
                                <MessageSquare size={22} />
                                <span>Assistant Portal</span>
                            </motion.button>
                        </Link>
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl transition-all"
                            >
                                <ShieldCheck size={22} />
                                <span>Admin Access</span>
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Line Wave Animation */}
                <LineWave />

                {/* Glassmorphic Background Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -z-10 animate-pulse"></div>
            </section>

            {/* Features Info Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl w-fit mb-8 shadow-inner group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{f.title}</h3>
                            <p className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors leading-relaxed">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* University Stats Section */}
            <section className="bg-white/40 border-y border-slate-100 py-24 mb-20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <div>
                        <div className="text-5xl font-black text-blue-600 mb-3 tracking-tighter">50+</div>
                        <div className="text-slate-400 uppercase text-[10px] tracking-[0.3em] font-black">Academic Courses</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black text-indigo-600 mb-3 tracking-tighter">10k+</div>
                        <div className="text-slate-400 uppercase text-[10px] tracking-[0.3em] font-black">Active Students</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black text-violet-600 mb-3 tracking-tighter">95%</div>
                        <div className="text-slate-400 uppercase text-[10px] tracking-[0.3em] font-black">Placement Rate</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black text-pink-600 mb-3 tracking-tighter">15+</div>
                        <div className="text-slate-400 uppercase text-[10px] tracking-[0.3em] font-black">Campus Hostels</div>
                    </div>
                </div>
            </section>
            
            {/* 🤖 Floating Robot Assistant */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.5, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8, type: 'spring' }}
                className="fixed bottom-8 right-8 z-50 group"
            >
                <Link to="/zhara" className="relative block">
                    {/* Tooltip */}
                    <div className="absolute bottom-[110%] right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
                        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl shadow-2xl whitespace-nowrap border border-white/10">
                             ✨ Talk to Zhara AI
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="w-2.5 h-2.5 bg-slate-900/90 rotate-45 absolute -bottom-1.5 right-8 border-r border-b border-white/10"></div>
                    </div>

                    {/* Robot Container */}
                    <div className="w-40 h-40">
                        <LottieView />
                    </div>
                </Link>
            </motion.div>
        </div>
    );
};

export default Landing;
