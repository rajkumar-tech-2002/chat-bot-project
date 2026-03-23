import React, { useState } from 'react';
import { Upload, Loader, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadDocument } from '../services/api.service';

const Admin = () => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);
    try {
      await uploadDocument(file);
      setStatus({ type: 'success', text: `Successfully indexed ${file.name} into Semantic Vector Store.` });
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to upload document. Ensure backend is reachable.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full pt-36 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Admin Master</h1>
        <p className="text-slate-500 font-semibold uppercase text-[10px] tracking-[0.3em]">Knowledge Base Management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        {/* Upload Knowledge Base Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="p-4 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl w-fit mb-8 shadow-xl shadow-blue-500/20">
            <FileText size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Ingest Intelligence</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Upload campus documents. Our RAG engine will chunk, embed, and store the vector knowledge persistently.</p>

          <label className="flex flex-col items-center justify-center space-y-6 border-4 border-dashed border-slate-100 hover:border-blue-400 bg-slate-50/50 rounded-3xl py-14 px-8 cursor-pointer transition-all group">
            {uploading ? (
              <Loader className="animate-spin text-blue-600" size={40} />
            ) : (
              <Upload className="text-slate-300 group-hover:text-blue-500 transition-all group-hover:-translate-y-2" size={40} />
            )}
            <div className="text-center">
              <span className="block font-black text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-widest text-xs mb-1">
                {uploading ? 'Processing Vectors...' : 'Select Source Document'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">PDF, DOCX, or TXT (Max 50MB)</span>
            </div>
            <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {status && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-8 p-5 rounded-2xl flex items-center space-x-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {status.type === 'success' && <CheckCircle size={24} />}
              <span className="text-sm font-black uppercase tracking-tight">{status.text}</span>
            </motion.div>
          )}
        </motion.div>

        {/* System Control & Telemetry Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/40 border border-white/50 rounded-[2.5rem] p-10 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Control</h2>
            <button 
                onClick={async () => {
                    if(window.confirm("Are you sure you want to clear the AI Knowledge Base? This will wipe all uploaded data from the AI memory.")) {
                        const { clearKnowledgeBase } = await import('../services/api.service');
                        await clearKnowledgeBase();
                        alert("AI Memory Cleared Successfully.");
                        window.location.reload();
                    }
                }}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
                Reset AI Memory
            </button>
          </div>
          <div className="space-y-6 flex-1">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex items-center space-x-4">
                  <div className="h-3 bg-slate-200 rounded-full w-4 flex-shrink-0"></div>
                  <div className={`h-3 bg-slate-100 rounded-full flex-1 w-${i*2}/12`}></div>
               </div>
             ))}
          </div>
          <div className="mt-auto border-t border-slate-100 pt-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose">
              Knowledge base is stored in a volatile<br/>Semantic Vector Store for high performance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
