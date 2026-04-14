import React from 'react';
import { User, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const VisitorList = ({ visitors, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] transition-all duration-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Retrieving Visitor Database...</p>
      </div>
    );
  }

  if (!visitors || visitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] transition-all duration-500">
        <User size={48} className="text-slate-200 dark:text-slate-800 mb-6" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">No visitors found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visitors.map((visitor, i) => (
        <motion.div 
           initial={{ y: 20, opacity: 0 }} 
           animate={{ y: 0, opacity: 1 }} 
           transition={{ delay: i * 0.1 }}
           key={visitor.id} 
           className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
               <User size={20} className="font-bold" />
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 transition-colors">{visitor.name}</h4>
               <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Verified Visitor</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 group">
              <Mail size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{visitor.email}</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <Phone size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{visitor.mobile}</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <Clock size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Last Intelligence Interaction</span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                  {visitor.lastActivity ? new Date(visitor.lastActivity).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">Active Session</span>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all">View Logs</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VisitorList;
