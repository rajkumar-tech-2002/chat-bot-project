import React from 'react';
import { MessageSquare, Mic, Calendar, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityTable = ({ logs, loading, typeFilter, setTypeFilter }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] transition-all duration-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Aggregating Cloud Logs...</p>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] transition-all duration-500">
        <Search size={48} className="text-slate-200 dark:text-slate-800 mb-6" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">No activity records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50">
              <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Date & Time</th>
              <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Type</th>
              <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Visitor</th>
              <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Inquiry</th>
              <th className="px-8 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">Intelligence Response</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <motion.tr 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="group border-b border-white/10 hover:bg-white/10 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black">
                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${
                    log.type === 'chat' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  }`}>
                    {log.type === 'chat' ? <MessageSquare size={12} /> : <Mic size={12} />}
                    <span className="text-[10px] font-black uppercase tracking-tight">{log.type}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{log.visitor_name || 'Anonymous'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{log.visitor_email || 'No email'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs line-clamp-2 leading-relaxed">
                     {log.question || 'N/A'}
                   </p>
                </td>
                <td className="px-8 py-6">
                   <p className="text-xs text-slate-500 dark:text-slate-500 font-medium max-w-xs line-clamp-2 italic leading-relaxed">
                     {log.answer?.substring(0, 100)}...
                   </p>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
