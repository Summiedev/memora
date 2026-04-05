// components/MemoryModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from '../utils/auth';
import { X, Pencil, Check, Image, FileText, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemoryModal({ memory, type, onClose, onSave, onDelete }) {
  const isPhoto = type === "photo";
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // form fields
  const [title, setTitle]       = useState("");
  const [caption, setCaption]   = useState("");
  const [photos, setPhotos]     = useState([]);
  const [entryText, setEntryText] = useState("");
  const [emotionTag, setEmotionTag] = useState("");

  const EMOTION_EMOJI = {
    happy:'😊', peaceful:'😌', anxious:'🥺', sad:'😔',
    angry:'😤', grateful:'🥰', excited:'🤩',
  };

  useEffect(() => {
    setIsEditing(false);
    setActivePhoto(0);
    setTitle(memory.title || "");
    if (isPhoto) {
      setCaption(memory.description || "");
      setPhotos((memory.photos || []).map(url => ({ url, isNew: false })));
    } else {
      setEntryText(memory.content || "");
      setEmotionTag(memory.emotionTag || "");
    }
  }, [memory, isPhoto]);

  const handleFileChange = e => {
    const newOnes = Array.from(e.target.files).map(f => ({ file: f, isNew: true, url: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...newOnes]);
  };

  const removePhoto = (idx) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
    if (activePhoto >= idx && activePhoto > 0) setActivePhoto(activePhoto - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalPhotos = photos.filter(p => !p.isNew).map(p => p.url);

      if (isPhoto) {
        const { data: sig } = await api.get(`/cloudinary-signature/signature?folder=capsule_media`);
        const uploaded = await Promise.all(
          photos.filter(p => p.isNew).map(async ({ file }) => {
            const form = new FormData();
            form.append("file", file);
            form.append("api_key", sig.apiKey);
            form.append("timestamp", sig.timestamp);
            form.append("signature", sig.signature);
            form.append("folder", "capsule_media");
            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, form
            );
            return res.data.secure_url;
          })
        );
        finalPhotos = [...finalPhotos, ...uploaded];
      }

      const payload = {
        title,
        ...(isPhoto
          ? { description: caption, photos: finalPhotos }
          : { content: entryText, emotionTag, date: memory.createdAt }),
      };

      const { data } = await api.patch(
        `/${isPhoto ? "photo-memories" : "diary-entries"}/${memory._id}`,
        payload
      );
      onSave(data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete this ${isPhoto ? 'album' : 'diary entry'}? This can't be undone.`)) return;
    try {
      await api.delete(`/${isPhoto ? "photo-memories" : "diary-entries"}/${memory._id}`);
      if (onDelete) onDelete(memory._id);
      onClose();
    } catch {
      alert("Failed to delete");
    }
  };

  const displayPhotos = isPhoto ? (isEditing ? photos : (memory.photos || [])) : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white w-full sm:rounded-3xl sm:max-w-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '95vh', borderRadius: '24px 24px 0 0' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Gradient top strip */}
          <div className="h-1.5 flex-shrink-0"
            style={{ background: isPhoto
              ? 'linear-gradient(90deg,#f9a8d4,#93c5fd)'
              : 'linear-gradient(90deg,#c4b5fd,#818cf8)' }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPhoto ? 'bg-pink-100' : 'bg-violet-100'}`}>
                {isPhoto ? <Image size={15} className="text-pink-500" /> : <FileText size={15} className="text-violet-500" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {isPhoto ? 'Photo Album' : 'Diary Entry'}
                </p>
                <p className="text-xs text-gray-400">{new Date(memory.createdAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600 text-xs font-bold hover:bg-violet-100 transition-colors">
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={handleDelete}
                    className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <button onClick={onClose}
                className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {!isEditing ? (
              /* ── VIEW MODE ── */
              <div className="p-5 space-y-4">
                <h2 className="text-2xl font-black text-gray-800 leading-tight">{title}</h2>

                {isPhoto ? (
                  <>
                    {/* Photo gallery */}
                    {displayPhotos.length > 0 && (
                      <div>
                        {/* Main photo */}
                        <div className="rounded-2xl overflow-hidden bg-gray-100 mb-2" style={{ height: '200px' }}>
                          <img src={displayPhotos[activePhoto]} alt=""
                            className="w-full h-full object-cover" />
                        </div>
                        {/* Thumbnails */}
                        {displayPhotos.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {displayPhotos.map((url, i) => (
                              <button key={i} onClick={() => setActivePhoto(i)}
                                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-pink-400 scale-105' : 'border-transparent opacity-70'}`}>
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {memory.description && (
                      <p className="text-gray-600 text-sm italic leading-relaxed">{memory.description}</p>
                    )}
                  </>
                ) : (
                  <>
                    {memory.emotionTag && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{EMOTION_EMOJI[memory.emotionTag] || '💭'}</span>
                        <span className="text-xs font-semibold text-violet-500 capitalize">{memory.emotionTag}</span>
                      </div>
                    )}
                    <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                      <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm dancing-script" style={{ fontSize:'1rem' }}>
                        {memory.content}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ── EDIT MODE ── */
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wide block mb-1.5">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl text-sm font-semibold text-gray-800 outline-none focus:border-violet-300 transition-colors"
                    placeholder="Title…" />
                </div>

                {isPhoto ? (
                  <>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wide block mb-1.5">Caption</label>
                      <textarea value={caption} onChange={e => setCaption(e.target.value)}
                        rows={3} className="w-full px-4 py-3 border-2 border-pink-100 rounded-2xl text-sm text-gray-700 outline-none focus:border-pink-300 resize-none transition-colors"
                        placeholder="Add a caption…" />
                    </div>

                    {/* Photos grid */}
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wide block mb-2">Photos</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {photos.map((p, i) => (
                          <div key={i} className="relative group">
                            <img src={p.url} alt=""
                              className="w-full h-24 object-cover rounded-xl border border-pink-100" />
                            <button onClick={() => removePhoto(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow">
                              ×
                            </button>
                          </div>
                        ))}
                        {/* Add photo button */}
                        <label className="w-full h-24 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-colors text-pink-400">
                          <Plus size={16} />
                          <span className="text-[10px] font-semibold mt-1">Add</span>
                          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Emotion tag */}
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wide block mb-2">Mood</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(EMOTION_EMOJI).map(([tag, emoji]) => (
                          <button key={tag} onClick={() => setEmotionTag(emotionTag === tag ? "" : tag)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${emotionTag === tag ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                            {emoji} {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wide block mb-1.5">Entry</label>
                      <textarea value={entryText} onChange={e => setEntryText(e.target.value)}
                        rows={8} className="w-full px-4 py-3 border-2 border-violet-100 rounded-2xl text-sm text-gray-800 outline-none focus:border-violet-300 resize-none transition-colors dancing-script"
                        style={{ fontSize: '1rem' }}
                        placeholder="Write your memory…" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer action buttons */}
          {isEditing && (
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
              <button onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: isPhoto
                  ? 'linear-gradient(135deg,#ec4899,#f97316)'
                  : 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
                {saving ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
                ) : (
                  <><Check size={14} /> Save Changes</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
