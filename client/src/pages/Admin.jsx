import React, { useState, useEffect } from 'react';
import { 
  Upload, Loader, FileText, CheckCircle, 
  LayoutDashboard, Users, Activity, Database,
  Calendar, Filter, Download, Trash2, Search, X, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  uploadDocument, clearKnowledgeBase, 
  getAdminStats, getAdminActivity, getAdminVisitors, deleteDocument
} from '../services/api.service';
import { toast } from 'sonner';
import DashboardStats from './admin/DashboardStats';
import ActivityTable from './admin/ActivityTable';
import VisitorList from './admin/VisitorList';
import AvatarManager from './admin/AvatarManager';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white dark:border-white/10"
      >
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{message}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="animate-spin" size={16} /> : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Admin = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Knowledge Base State
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: '',
    type: 'all'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await getAdminStats();
      const visitorsData = await getAdminVisitors();
      const logsData = await getAdminActivity(filters);
      
      setStats(statsData.stats);
      setVisitors(visitorsData.visitors);
      setLogs(logsData.logs);

      if (activeTab === 'knowledge') {
        const { getAllDocuments } = await import('../services/api.service');
        const docsData = await getAllDocuments();
        setDocuments(docsData.documents);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocument(file);
      toast.success(`Successfully indexed ${file.name} into AI Knowledge Base!`);
      // Re-fetch docs
      const { getAllDocuments } = await import('../services/api.service');
      const docsData = await getAllDocuments();
      setDocuments(docsData.documents);
      fetchData(); // Refresh stats
    } catch (error) {
      toast.error('Failed to upload document. Please ensure it is a valid PDF, DOCX, or TXT file.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', month: '', type: 'all' });
  };

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full pt-36 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Page Header - Refined for Integrated Navbar */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 px-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[8px] tracking-[0.3em]">System Admin</p>
            </div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight lowercase first-letter:uppercase transition-colors duration-500">
            Admin <span className="text-indigo-600 dark:text-indigo-400">Console</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-2">Manage your campus intelligence and visitor interactions in real-time.</p>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <DashboardStats stats={stats} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] p-10 flex flex-col shadow-sm backdrop-blur-3xl transition-all duration-500">
                    <h3 className="text-md font-black text-slate-900 dark:text-white mb-6 flex items-center uppercase tracking-widest">
                       <Shield size={16} className="mr-3 text-indigo-600 dark:text-indigo-400" />
                       Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => window.location.href='/admin?tab=knowledge'} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-3xl hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group shadow-sm">
                          <Upload size={24} className="text-blue-500 dark:text-blue-400 mb-3 group-hover:-translate-y-1 transition-transform" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Upload Data</p>
                       </button>
                       <button onClick={() => window.location.href='/admin?tab=activity'} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-3xl hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left group shadow-sm">
                          <Download size={24} className="text-violet-500 dark:text-violet-400 mb-3 group-hover:-translate-y-1 transition-transform" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Get Reports</p>
                       </button>
                    </div>
                 </div>
                 
                 <div className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] p-10 shadow-sm backdrop-blur-3xl transition-all duration-500">
                    <h3 className="text-md font-black text-slate-900 dark:text-white mb-6 flex items-center uppercase tracking-widest">
                       <Users size={16} className="mr-3 text-emerald-600 dark:text-emerald-400" />
                       Recent Visitors
                    </h3>
                    <div className="space-y-4">
                       {visitors.slice(0, 3).map((v, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
                            <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                  {v.name[0]}
                               </div>
                               <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{v.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{new Date(v.lastActivity).toLocaleDateString()}</span>
                         </div>
                       ))}
                       <button onClick={() => window.location.href='/admin?tab=visitors'} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">See all visitors</button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Visitors Tab */}
          {activeTab === 'visitors' && (
            <VisitorList visitors={visitors} loading={loading} />
          )}

          {/* Avatars Tab */}
          {activeTab === 'avatars' && (
            <AvatarManager />
          )}

          {/* Activity Logs / Reports Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-8">
              {/* Report Controls / Filters */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-end gap-6 duration-500">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center">
                    <Calendar size={12} className="mr-2" /> Start Date
                  </p>
                  <input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center">
                    <Calendar size={12} className="mr-2" /> End Date
                  </p>
                  <input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center">
                    <Filter size={12} className="mr-2" /> Select Month
                  </p>
                  <select 
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">Full Transcript History</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                   <button 
                      onClick={handleResetFilters}
                      className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-all flex items-center"
                   >
                     <X size={14} className="mr-2" /> Clear
                   </button>
                   <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center">
                     <Download size={14} className="mr-2" /> Export
                   </button>
                </div>
              </div>

              <ActivityTable logs={logs} loading={loading} />
            </div>
          )}

          {/* Knowledge Base Tab - Premium Redesign */}
          {activeTab === 'knowledge' && (
            <div className="space-y-10">
              {/* Header Info */}


              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm transition-all duration-500">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center">
                      <Upload size={14} className="mr-2" /> Ingest New Source
                    </h3>
                    
                    <label className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl py-12 px-6 cursor-pointer transition-all group overflow-hidden relative">
                      {uploading ? (
                        <>
                          <Loader className="animate-spin text-indigo-600 mb-2" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Syncing...</span>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <Upload size={24} />
                          </div>
                          <div className="text-center">
                            <span className="block font-black text-slate-700 uppercase tracking-widest text-[10px]">Add Document</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 block">PDF / DOCX / TXT</span>
                          </div>
                        </>
                      )}
                      <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Wipe Engine Memory",
                            message: "WARNING: This will delete ALL uploaded documents and reset the AI's training data. Are you sure?",
                            onConfirm: async () => {
                              setConfirmModal(prev => ({ ...prev, isLoading: true }));
                              try {
                                await clearKnowledgeBase();
                                toast.success("AI Intelligence Wiped Successfully.");
                                window.location.reload();
                              } catch (err) {
                                toast.error("Error clearing knowledge base. Please try again.");
                                setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                              }
                            }
                          });
                        }}
                        className="w-full py-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-900 hover:text-white transition-all flex items-center justify-center gap-2 group"
                      >
                         <Trash2 size={14} className="group-hover:animate-bounce" /> Wipe Engine Memory
                       </button>
                       <p className="text-[9px] text-center text-slate-400 font-bold italic mt-4 px-4 leading-relaxed">
                         Clearing memory will force the AI back to its base configuration.
                       </p>
                    </div>
                  </motion.div>
                </div>

                {/* Document List Section */}
                <div className="lg:col-span-2">
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] p-1 shadow-sm h-full overflow-hidden transition-all duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] p-8 h-full flex flex-col transition-all duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
                          <FileText size={14} className="mr-2" /> Current Knowledge Base Documents
                        </h3>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Live Data
                        </span>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[500px] scrollbar-hide">
                        {documents.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                             <Search size={48} className="mb-4 text-slate-300" />
                             <p className="text-xs font-black uppercase tracking-widest text-slate-400">No documents indexed yet</p>
                          </div>
                        ) : (
                          documents.map((doc, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              key={doc.id} 
                              className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 rounded-[1.8rem] group hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/5"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <FileText size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{doc.title}</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                      {new Date(doc.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => {
                                   setConfirmModal({
                                     isOpen: true,
                                     title: "Delete Document",
                                     message: `Are you sure you want to delete "${doc.title}"? This cannot be undone.`,
                                     onConfirm: async () => {
                                       setConfirmModal(prev => ({ ...prev, isLoading: true }));
                                       try {
                                         await deleteDocument(doc.id);
                                         toast.success("Document deleted successfully.");
                                         const { getAllDocuments } = await import('../services/api.service');
                                         const d = await getAllDocuments();
                                         setDocuments(d.documents);
                                         setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                                       } catch (e) {
                                         toast.error("Failed to delete document.");
                                         setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
                                       }
                                     }
                                   });
                                 }}
                                 className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                               >
                                  <Trash2 size={16} />
                                </button>
                            </motion.div>
                          ))
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">RAG Engine Optimized</span>
                         </div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">Semantic Matching Active</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <ConfirmModal 
        {...confirmModal} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Admin;
