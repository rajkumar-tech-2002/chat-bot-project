import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Loader, Trash2, UserCircle2,
  ImagePlus, Check, X, RefreshCw, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { getAvatars, createAvatar, deleteAvatar } from '../../services/api.service';

const BACKEND_URL = 'http://localhost:3000';

const GenderBadge = ({ gender }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
    ${gender === 'female'
      ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800'
      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'}`}>
    {gender === 'female' ? '♀ Female' : '♂ Male'}
  </span>
);

const AvatarManager = () => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', gender: 'female', description: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewGreeting, setPreviewGreeting] = useState(null);
  const [previewSpeaking, setPreviewSpeaking] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedGreeting, setSelectedGreeting] = useState(null);
  const [selectedSpeaking, setSelectedSpeaking] = useState(null);

  const fileInputRef = useRef(null);
  const greetingInputRef = useRef(null);
  const speakingInputRef = useRef(null);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);

  const fetchAvatars = async () => {
    setLoading(true);
    try {
      const data = await getAvatars();
      setAvatars(data.avatars || []);
    } catch (err) {
      toast.error('Failed to load avatars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const handleFileSelect = (e, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(file);
    } else if (type === 'greeting') {
      setSelectedGreeting(file);
      setPreviewGreeting(URL.createObjectURL(file));
    } else if (type === 'speaking') {
      setSelectedSpeaking(file);
      setPreviewSpeaking(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an avatar image.');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Please enter a name for the avatar.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar_image', selectedFile);
      if (selectedGreeting) formData.append('greeting_video', selectedGreeting);
      if (selectedSpeaking) formData.append('speaking_video', selectedSpeaking);

      formData.append('name', form.name.trim());
      formData.append('gender', form.gender);
      formData.append('description', form.description.trim());

      await createAvatar(formData);
      toast.success(`Avatar "${form.name}" created successfully!`);

      // Reset form
      clearForm();

      await fetchAvatars();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeletingId(id);
    try {
      await deleteAvatar(id);
      toast.success(`Avatar "${name}" deleted.`);
      setAvatars(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete avatar.');
    } finally {
      setDeletingId(null);
    }
  };

  const clearForm = () => {
    setForm({ name: '', gender: 'female', description: '' });
    setPreviewImage(null);
    setPreviewGreeting(null);
    setPreviewSpeaking(null);
    setSelectedFile(null);
    setSelectedGreeting(null);
    setSelectedSpeaking(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (greetingInputRef.current) greetingInputRef.current.value = '';
    if (speakingInputRef.current) speakingInputRef.current.value = '';
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Upload / Create Form ─────────────────────────── */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm transition-all duration-500"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center">
              <ImagePlus size={14} className="mr-2" /> Create New Avatar
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl py-8 px-6 cursor-pointer transition-all group overflow-hidden"
              >
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-2xl shadow-lg ring-4 ring-violet-500/20"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check size={12} className="text-white" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 p-3 bg-violet-600 rounded-2xl text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <span className="block font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]">
                      Upload Avatar Image
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 block">
                      JPG / PNG / WebP · Max 5MB
                    </span>
                    <span className="text-[9px] text-slate-300 dark:text-slate-600 font-bold mt-1 block">
                      Or drag & drop here
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
              </div>

              {/* Video Uploads Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Greeting Video */}
                <div
                  onClick={() => greetingInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-violet-400 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl py-4 px-3 cursor-pointer transition-all group overflow-hidden"
                >
                  {previewGreeting ? (
                    <video src={previewGreeting} className="w-full h-24 object-cover rounded-lg" muted loop onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                  ) : (
                    <div className="text-center">
                      <Upload size={16} className="mx-auto mb-1 text-violet-500" />
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Greeting Video</span>
                    </div>
                  )}
                  <input ref={greetingInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'greeting')} />
                </div>

                {/* Speaking Video */}
                <div
                  onClick={() => speakingInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-violet-400 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl py-4 px-3 cursor-pointer transition-all group overflow-hidden"
                >
                  {previewSpeaking ? (
                    <video src={previewSpeaking} className="w-full h-24 object-cover rounded-lg" muted loop onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                  ) : (
                    <div className="text-center">
                      <Upload size={16} className="mx-auto mb-1 text-violet-500" />
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Speaking Video</span>
                    </div>
                  )}
                  <input ref={speakingInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'speaking')} />
                </div>
              </div>

              {/* Avatar Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                  Avatar Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Zhara, Zaid, Aria..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: 'female' })}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border
                      ${form.gender === 'female'
                        ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                        : 'bg-pink-50 dark:bg-pink-900/20 text-pink-500 border-pink-100 dark:border-pink-900 hover:bg-pink-100 dark:hover:bg-pink-900/30'}`}
                  >
                    ♀ Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: 'male' })}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border
                      ${form.gender === 'male'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 border-blue-100 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}
                  >
                    ♂ Male
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                  Description <span className="text-slate-300 dark:text-slate-600 normal-case font-medium">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Warm · Friendly · Empathetic"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {previewImage && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !form.name.trim()}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/30 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader size={14} className="animate-spin" /> Creating...</>
                  ) : (
                    <><ImagePlus size={14} /> Create Avatar</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ── Avatar List ───────────────────────────────────── */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/40 dark:bg-slate-900/40 border border-white dark:border-white/10 rounded-[2.5rem] p-1 shadow-sm h-full overflow-hidden transition-all duration-500"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] p-8 h-full flex flex-col transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center">
                  <Users size={14} className="mr-2" /> Active Avatars
                </h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-violet-100 dark:border-violet-800">
                    {avatars.length} Total
                  </span>
                  <button
                    onClick={fetchAvatars}
                    className="p-2 text-slate-400 hover:text-violet-600 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[520px] scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader size={32} className="animate-spin text-violet-500" />
                  </div>
                ) : avatars.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                    <UserCircle2 size={48} className="mb-4 text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      No avatars created yet
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Create your first avatar using the form
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {avatars.map((avatar, idx) => (
                      <motion.div
                        key={avatar.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 rounded-[1.8rem] group hover:border-violet-200 dark:hover:border-violet-900 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-md hover:shadow-violet-500/5"
                      >
                        <div className="flex items-center gap-5">
                          {/* Avatar Image */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={`${BACKEND_URL}${avatar.image_url}`}
                              alt={avatar.name}
                              className="w-16 h-16 object-cover rounded-2xl shadow-md ring-2 ring-white dark:ring-slate-800"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=7c3aed&color=fff&size=128&font-size=0.4`;
                              }}
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900
                              ${avatar.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'}`} />
                          </div>

                          {/* Avatar Info */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                              {avatar.name}
                            </h4>
                            <GenderBadge gender={avatar.gender} />
                            {avatar.description && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">
                                {avatar.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(avatar.id, avatar.name)}
                          disabled={deletingId === avatar.id}
                          className="p-2.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50"
                          title="Delete avatar"
                        >
                          {deletingId === avatar.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                    Avatars Synced Live
                  </span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
                  Shown on /zhara page
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AvatarManager;
