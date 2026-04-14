import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Loader, GraduationCap, BrainCircuit, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api.service';
import useTheme from '../hooks/useTheme';

const features = [
    { icon: BrainCircuit, text: 'AI-Powered Knowledge Base' },
    { icon: GraduationCap, text: 'College Information Assistant' },
    { icon: ShieldCheck, text: 'Secure Admin Access' },
];

const Login = ({ setAuthenticated }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme-based colors
    const bgColor = isDark ? '#0f172a' : '#ffffff';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const inputBg = isDark ? '#1e293b' : '#f9fafb';
    const inputBorder = isDark ? '#334155' : '#e5e7eb';
    const labelColor = isDark ? '#94a3b8' : '#374151';
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
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            zIndex: 9999,
            background: '#0f172a'
        }}>

            {/* ─── LEFT PANEL ─── */}
            <div style={{
                flex: '0 0 55%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '56px'
            }} className="login-left-panel">
                {/* Background Image */}
                <img
                    src="/login-bg.png"
                    alt="Campus"
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
                {/* Dark gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 50%, rgba(15,23,42,0.15) 100%)'
                }} />

                {/* Logo top-left - Clickable */}
                <Link to="/" style={{ 
                    position: 'absolute', top: '40px', left: '48px', 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    textDecoration: 'none',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
                    }}>
                        <GraduationCap size={22} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px' }}>
                        Campus AI
                    </span>
                </Link>

                {/* Bottom text content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(99,102,241,0.25)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: '100px',
                            padding: '6px 16px',
                            marginBottom: '20px'
                        }}>
                            <span style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                Admin Portal
                            </span>
                        </div>

                        <h1 style={{
                            color: 'white', fontSize: 'clamp(28px, 3.5vw, 42px)',
                            fontWeight: 900, lineHeight: 1.15,
                            letterSpacing: '-1px', marginBottom: '16px'
                        }}>
                            AI-Powered Platform<br />
                            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Knowledge Manager
                            </span>
                        </h1>

                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '380px' }}>
                            Manage your AI assistant's knowledge base, upload documents, and monitor conversations from one place.
                        </p>

                        {/* Feature badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {features.map(({ icon: Icon, text }, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.12 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'rgba(99,102,241,0.2)',
                                        border: '1px solid rgba(99,102,241,0.35)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={16} color="#818cf8" />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: 500 }}>{text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── RIGHT PANEL ─── */}
            <div style={{
                flex: '0 0 45%',
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 40px',
                overflowY: 'auto',
                position: 'relative',
                transition: 'all 0.5s ease'
            }}>
                {/* Back to Home Button */}
                <Link to="/" style={{
                    position: 'absolute', top: '40px', right: '40px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    textDecoration: 'none',
                    color: subTextColor, fontSize: '13px', fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '100px',
                    background: isDark ? '#1e293b' : '#f8fafc',
                    border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                    transition: 'all 0.2s',
                    zIndex: 10
                }} onMouseOver={e => { e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'; e.currentTarget.style.color = textColor; }} 
                   onMouseOut={e => { e.currentTarget.style.background = isDark ? '#1e293b' : '#f8fafc'; e.currentTarget.style.color = subTextColor; }}>
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ width: '100%', maxWidth: '380px' }}
                >
                    {/* Header */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 12px 32px rgba(99,102,241,0.35)'
                        }}>
                            <Lock size={26} color="white" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: textColor, letterSpacing: '-0.6px', marginBottom: '8px', transition: 'color 0.5s ease' }}>
                            Welcome back
                        </h2>
                        <p style={{ color: subTextColor, fontSize: '14px', lineHeight: 1.6, transition: 'color 0.5s ease' }}>
                            Sign in to access your admin dashboard and manage the AI knowledge base.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* User ID Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: labelColor, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'color 0.5s ease' }}>
                                Admin ID
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    required
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Enter your admin ID"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 46px',
                                        border: `1.5px solid ${inputBorder}`,
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        color: textColor,
                                        background: inputBg,
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = isDark ? '#1e293b' : '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = 'none'; e.target.style.background = inputBg; }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: labelColor, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'color 0.5s ease' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 46px',
                                        border: `1.5px solid ${inputBorder}`,
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        color: textColor,
                                        background: inputBg,
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; e.target.style.background = isDark ? '#1e293b' : '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = 'none'; e.target.style.background = inputBg; }}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginBottom: '20px',
                                    padding: '12px 16px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '10px',
                                    color: '#dc2626',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(99,102,241,0.35)' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: 800,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                letterSpacing: '0.3px',
                                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? (
                                <><Loader size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Signing In...</>
                            ) : (
                                <>Sign In <ArrowRight size={20} /></>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer note */}
                    <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                        🔒 Protected access · Authorized personnel only<br />
                        <span style={{ color: '#cbd5e1' }}>Nandha Engineering College Admin Portal</span>
                    </p>
                </motion.div>
            </div>

            {/* Responsive styles */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          div[style*="flex: 0 0 45%"] { flex: 1 1 100% !important; }
        }
      `}</style>
        </div>
    );
};

export default Login;
