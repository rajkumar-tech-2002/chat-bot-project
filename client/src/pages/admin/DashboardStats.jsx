import React from 'react';
import { Users, MessageSquare, Mic, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    transition={{ delay }}
    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col relative overflow-hidden group transition-all duration-500"
  >
    <div className={`absolute top-0 right-0 p-16 bg-gradient-to-br ${color} opacity-5 rounded-full blur-3xl -mr-8 -mt-8 group-hover:opacity-10 transition-opacity`}></div>
    <div className={`p-3 rounded-2xl w-fit mb-4 bg-gradient-to-br ${color} shadow-lg shadow-blue-500/10`}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</span>
    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{value}</h3>
  </motion.div>
);

const DashboardStats = ({ stats, trend }) => {
  if (!stats) return null;

  const cards = [
    { title: 'Total Visitors', value: stats.totalUsers || 0, icon: Users, color: 'from-blue-600 to-indigo-600', delay: 0.1 },
    { title: 'Chat Interactions', value: stats.totalConversations || 0, icon: MessageSquare, color: 'from-violet-600 to-purple-600', delay: 0.2 },
    { title: 'Voice Inquiries', value: stats.totalVoiceLogs || 0, icon: Mic, color: 'from-emerald-600 to-teal-600', delay: 0.3 },
    { title: 'Knowledge Assets', value: stats.totalDocuments || 0, icon: FileText, color: 'from-orange-600 to-amber-600', delay: 0.4 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
};

export default DashboardStats;
