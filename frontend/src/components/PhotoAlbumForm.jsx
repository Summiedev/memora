import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

const inp = "w-full px-4 py-3 rounded-2xl bg-white border-2 border-blue-100 text-blue-900 placeholder-blue-300 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 text-sm transition-all";

export default function PhotoAlbumForm({ closeForm, onCreate = () => {} }) {
  const [title, setTitle]         = useState("");
  const [caption, setCaption]     = useState("");
  const [photos, setPhotos]       = useState([]); // {file, preview, caption:''}
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [errors, setErrors]       = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const fileRef = useRef();
  const MAX_PHOTOS = 20;

  const addFiles = (files) => {
    const valid = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, MAX_PHOTOS - photos.length);
    const newPhotos = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      caption: '',
      id: Math.random().toString(36).slice(2),
    }));
    setPhotos(p => [...p, ...newPhotos]);
  };

  const onFileInput  = e => { addFiles(e.target.files); e.target.value = ''; };
  const onDrop       = e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const onDragOver   = e => { e.preventDefault(); setDragOver(true); };
  const onDragLeave  = () => setDragOver(false);
  const removePhoto  = id => setPhotos(p => p.filter(x => x.id !== id));
  const updateCaption = (id, cap) => setPhotos(p => p.map(x => x.id === id ? { ...x, caption: cap } : x));
  const movePhoto = (from, to) => {
    setPhotos(p => {
      const a = [...p]; const [item] = a.splice(from, 1); a.splice(to, 0, item); return a;
    });
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Give your album a title ✦';
    if (photos.length === 0) e.photos = 'Add at least one photo 📸';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setUploading(true);
      setUploadPct(0);
      const { data: sig } = await axios.get("http://localhost:5000/api/cloudinary-signature/signature");
      const uploadedUrls = await Promise.all(
        photos.map(async ({ file }, idx) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("api_key", sig.apiKey);
          fd.append("timestamp", sig.timestamp);
          fd.append("signature", sig.signature);
          fd.append("folder", "album_images");
          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, fd,
            { onUploadProgress: ev => setUploadPct(Math.round(((idx + ev.loaded / ev.total) / photos.length) * 100)) }
          );
          setUploadPct(Math.round(((idx + 1) / photos.length) * 100));
          return res.data.secure_url;
        })
      );
      const { data } = await axios.post(
        "http://localhost:5000/api/photo-memories/create-photo-album",
        { title, description: caption, photos: uploadedUrls, captions: photos.map(p => p.caption) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setShowSuccess(true);
      setTimeout(() => { onCreate(data.data); closeForm(); }, 1200);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save album. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(30,58,138,0.18)', backdropFilter:'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>

      <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="w-full sm:max-w-2xl bg-white flex flex-col overflow-hidden"
        style={{ maxHeight:'95vh', borderRadius:'24px 24px 0 0' }}
        onClick={e => e.stopPropagation()}>

        {/* top strip */}
        <div className="h-1.5 flex-shrink-0" style={{ background:'linear-gradient(90deg,#93c5fd,#c4b5fd,#f9a8d4,#6ee7b7)' }} />

        {/* header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-blue-50"
          style={{ background:'linear-gradient(135deg,#eff6ff,#fdf4ff)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="chewy text-2xl text-blue-700">New Photo Album 📸</h2>
              <p className="text-xs text-blue-400 mt-0.5 font-medium">Capture moments that deserve to be remembered ✨</p>
            </div>
            <button onClick={closeForm} disabled={uploading}
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-pink-50 flex items-center justify-center text-blue-400 hover:text-pink-500 font-bold text-lg transition-colors flex-shrink-0">×</button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* title + caption */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-blue-600 mb-1.5 uppercase tracking-wider">Album Title ✦</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer 2025, Birthday Trip…" className={inp} maxLength={80} />
              {errors.title && <p className="text-pink-500 text-xs mt-1">⚠ {errors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-600 mb-1.5 uppercase tracking-wider">Album Description (optional)</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What's the story behind these photos? ♡" rows={2}
                className={inp + ' resize-none'} maxLength={500} />
            </div>
          </div>

          {/* drop zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider">Photos 🖼️</label>
              <span className="text-xs text-blue-400 font-medium">{photos.length}/{MAX_PHOTOS}</span>
            </div>
            <button type="button" onClick={() => fileRef.current.click()}
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              disabled={photos.length >= MAX_PHOTOS}
              className={`w-full py-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center gap-3 ${
                dragOver ? 'border-pink-400 bg-pink-50 scale-[1.01]' :
                photos.length >= MAX_PHOTOS ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' :
                'border-blue-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dragOver ? 'bg-pink-100' : 'bg-blue-50'}`}>
                <Upload size={24} className={dragOver ? 'text-pink-500' : 'text-blue-400'} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-600">{dragOver ? 'Drop here!' : photos.length >= MAX_PHOTOS ? 'Max photos reached' : 'Click or drag & drop photos'}</p>
                <p className="text-xs text-blue-400 mt-0.5">PNG, JPG, WEBP up to 10MB each</p>
              </div>
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={onFileInput} />
            {errors.photos && <p className="text-pink-500 text-xs mt-1">⚠ {errors.photos}</p>}
          </div>

          {/* photo grid */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Your Photos</p>
                <button type="button" onClick={() => setPhotos([])} className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">Clear all</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    className="relative rounded-2xl overflow-hidden group border-2 border-blue-50 hover:border-pink-200 transition-all shadow-sm hover:shadow-md">
                    <div className="aspect-square">
                      <img src={p.preview} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* remove */}
                    <button onClick={() => removePhoto(p.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <X size={11} className="text-white" />
                    </button>
                    {/* index */}
                    <div className="absolute top-2 left-2 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700">
                      {i+1}
                    </div>
                    {/* caption input */}
                    <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input value={p.caption} onChange={e => updateCaption(p.id, e.target.value)}
                        placeholder="Add caption…" maxLength={100}
                        onClick={e => e.stopPropagation()}
                        className="w-full bg-white/90 text-[11px] text-gray-800 px-2 py-1 rounded-lg border-none outline-none placeholder-gray-400 shadow" />
                    </div>
                  </motion.div>
                ))}
                {/* add more */}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-2 hover:border-pink-300 hover:bg-pink-50 transition-all text-blue-400 hover:text-pink-500">
                    <span className="text-2xl">+</span>
                    <span className="text-xs font-semibold">Add more</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* upload progress */}
        {uploading && (
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width:`${uploadPct}%`, background:'linear-gradient(90deg,#93c5fd,#c4b5fd,#f9a8d4)' }} />
              </div>
              <span className="text-xs font-bold text-blue-600 flex-shrink-0">{uploadPct}%</span>
            </div>
            <p className="text-xs text-blue-400 text-center">Uploading your memories… ✨</p>
          </div>
        )}

        {/* footer */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-blue-50 flex items-center justify-between gap-3"
          style={{ background:'linear-gradient(135deg,#eff6ff,#fdf4ff)' }}>
          <div className="text-xs text-blue-400 font-medium">
            {photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} ready` : 'No photos yet'}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={closeForm} disabled={uploading}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-60">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={uploading || showSuccess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-70"
              style={{ background: showSuccess ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
              {showSuccess ? <><CheckCircle size={15}/> Saved!</> : uploading ? `Uploading… ${uploadPct}%` : <><Image size={15}/> Save Album ♡</>}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
