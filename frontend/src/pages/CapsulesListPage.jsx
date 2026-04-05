import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import api from '../utils/auth';
import Navbar_Main from "../components/Navbar_main";
import CapsuleCard from "../components/CapsuleCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import { motion, AnimatePresence } from "framer-motion";
import ViewCapsuleModal from "../components/ViewCapsuleModal";
import { Search, SlidersHorizontal, Package, X, Share2, Copy, Check } from "lucide-react";
import MobileBottomNav from "../components/MobileBottomNav";

// ── Edit Capsule Modal ───────────────────────────────────────────────────────
function EditCapsuleModal({ capsule, onClose, onSaved }) {
  const [title, setTitle]     = useState(capsule.title || "");
  const [message, setMessage] = useState(capsule.message || "");
  const [tags, setTags]       = useState((capsule.tags || []).join(", "));
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { alert("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const { data } = await api.patch(`/capsules/${capsule._id}`, payload);
      onSaved(data.data || { ...capsule, ...payload });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update capsule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="chewy text-xl text-purple-700">Edit Capsule ✏️</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold text-lg">×</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-purple-500 uppercase tracking-wide block mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-100 rounded-2xl text-sm font-semibold outline-none focus:border-purple-300"
                placeholder="Capsule title…" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-500 uppercase tracking-wide block mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                rows={4} className="w-full px-4 py-2.5 border-2 border-purple-100 rounded-2xl text-sm outline-none focus:border-purple-300 resize-none"
                placeholder="Your message…" />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-500 uppercase tracking-wide block mb-1">Tags (comma-separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-100 rounded-2xl text-sm outline-none focus:border-purple-300"
                placeholder="memories, family, 2024…" />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Share Capsule Modal ──────────────────────────────────────────────────────
function ShareCapsuleModal({ capsule, onClose }) {
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/capsules`;

  useEffect(() => {
    api.get('/friends/list')
      .then(r => setFriends(r.data.friends || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFriend = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleShare = async () => {
    if (!selected.length) { alert("Select at least one friend"); return; }
    setSharing(true);
    try {
      await api.post(`/capsules/${capsule._id}/share`, { friendIds: selected });
      alert("Shared successfully! 🎉");
      onClose();
    } catch {
      alert("Failed to share capsule");
    } finally {
      setSharing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="chewy text-xl text-purple-700">Share Capsule 💌</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">×</button>
          </div>

          {/* Copy link */}
          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors mb-4">
            {copied ? <Check size={14}/> : <Copy size={14}/>}
            {copied ? 'Copied!' : 'Copy Share Link'}
          </button>

          {/* Friends list */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Share with friends</p>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse"/>)}</div>
          ) : friends.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No friends yet! Add some friends first.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {friends.map(f => (
                <button key={f._id} onClick={() => toggleFriend(f._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${selected.includes(f._id) ? 'border-purple-300 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {f.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{f.username}</span>
                  {selected.includes(f._id) && <Check size={14} className="text-purple-500 ml-auto" />}
                </button>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <button onClick={handleShare} disabled={sharing}
              className="w-full mt-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              {sharing ? 'Sharing…' : `Share with ${selected.length} friend${selected.length>1?'s':''}`}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Manage Capsule Modal ─────────────────────────────────────────────────────
function ManageCapsuleModal({ capsule, onClose, onDelete, onEdit }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4"
      style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="chewy text-xl text-purple-700">Manage Capsule ⚙️</h2>
              <p className="text-xs text-gray-400 truncate mt-0.5">{capsule.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">×</button>
          </div>

          <div className="space-y-2">
            <button onClick={() => { onEdit(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-colors text-left">
              <span className="text-xl">✏️</span> Edit Capsule
            </button>
            <button onClick={() => { /* onShare handled outside */ onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-colors text-left">
              <span className="text-xl">💌</span> Share Capsule
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete this capsule? This can't be undone.")) {
                  onDelete();
                  onClose();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-colors text-left">
              <span className="text-xl">🗑️</span> Delete Capsule
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const CapsuleListPage = () => {
  const [showForm, setShowForm]           = useState(false);
  const [capsules, setCapsules]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [viewCapsuleId, setViewCapsuleId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [sortOption, setSortOption]       = useState("recent");

  // Edit / Manage / Share modals
  const [editingCapsule,   setEditingCapsule]   = useState(null);
  const [managingCapsule,  setManagingCapsule]  = useState(null);
  const [sharingCapsule,   setSharingCapsule]   = useState(null);

  const fetchCapsules = async () => {
    try {
      const res = await api.get('/capsules/all-capsules');
      setCapsules(res.data.capsules || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCapsules(); }, []);

  const addCapsule    = c  => setCapsules(p => [c, ...p]);
  const removeCapsule = id => setCapsules(p => p.filter(c => c._id !== id));
  const updateCapsule = updated => setCapsules(p => p.map(c => c._id === updated._id ? updated : c));

  const handleDelete = async id => {
    try {
      await api.delete(`/capsules/delete-capsule/${id}`);
      removeCapsule(id);
    } catch (e) { console.error(e); }
  };

  const filteredCapsules = useMemo(() => {
    let list = [...capsules];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    list.sort((a, b) => {
      switch (sortOption) {
        case "oldest": return new Date(a.sendDate) - new Date(b.sendDate);
        case "atoz":   return (a.title||"").localeCompare(b.title||"");
        case "tags":   return (a.tags?.[0]||"").localeCompare(b.tags?.[0]||"");
        default:       return new Date(b.sendDate) - new Date(a.sendDate);
      }
    });
    return list;
  }, [capsules, searchQuery, sortOption]);

  return (
    <>
      <div className="min-h-screen pb-24 sm:pb-8" style={{ background: "linear-gradient(160deg,#fce4f3 0%,#ede9ff 40%,#dbeafe 100%)" }}>
        <Navbar_Main />
        <MobileBottomNav />

        {/* Page header */}
        <div className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 20%,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="chewy text-3xl sm:text-4xl text-white drop-shadow mb-1">✦ My Time Capsules</h1>
                  <p className="text-pink-100 text-sm font-medium">Every memory sealed with love 💌</p>
                </div>
                {/* Search + Sort */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search capsules…"
                      className="pl-9 pr-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-full" />
                  </div>
                  <div className="relative">
                    <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                    <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                      className="pl-8 pr-3 py-2.5 rounded-2xl bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none text-sm appearance-none cursor-pointer">
                      <option value="recent" className="text-gray-800">Recent</option>
                      <option value="oldest" className="text-gray-800">Oldest</option>
                      <option value="atoz"   className="text-gray-800">A–Z</option>
                      <option value="tags"   className="text-gray-800">Tags</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-purple-500" />
              <h2 className="text-base font-bold text-purple-700">
                {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''}
                {searchQuery && <span className="text-sm text-purple-400 font-normal ml-1">for "{searchQuery}"</span>}
              </h2>
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-pink-500 hover:text-pink-700 font-medium transition-colors flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner />
              <p className="text-purple-400 text-sm animate-pulse">Loading your memories…</p>
            </div>
          ) : filteredCapsules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-bold text-purple-600 mb-2">No capsules found</p>
              <p className="text-sm text-purple-400">
                {searchQuery ? "Try a different search term!" : "Create your first capsule to get started ✨"}
              </p>
              {!searchQuery && (
                <button onClick={() => setShowForm(true)}
                  className="mt-4 px-6 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md hover:scale-105 transition-transform"
                  style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                  Create Capsule ✦
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCapsules.map((capsule, idx) => (
                <motion.div key={capsule._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20, delay: idx * 0.06 }}
                  className="flex justify-center">
                  <CapsuleCard
                    image={capsule.coverImage || "/placeholder.png"}
                    title={capsule.title}
                    description={capsule.message}
                    unlockTime={capsule.sendDate}
                    onManage={() => setManagingCapsule(capsule)}
                    onDetails={() => { setViewCapsuleId(capsule._id); setShowViewModal(true); }}
                    sharedBy={capsule.sharedBy}
                    onShare={() => setSharingCapsule(capsule)}
                    onDelete={() => handleDelete(capsule._id)}
                    onEdit={() => setEditingCapsule(capsule)}
                    tags={capsule.tags || []}
                    capsuleId={capsule._id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <FloatingActions onCreate={() => setShowForm(true)} />
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.25)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl w-11/12 max-w-lg relative overflow-hidden"
              initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }}>
              <div className="h-1.5" style={{ background: "linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)" }} />
              <div className="p-6">
                <button onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-purple-50 hover:bg-pink-50 text-purple-400 hover:text-pink-500 text-xl transition-colors">×</button>
                <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} addCapsule={addCapsule} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details modal */}
      {showViewModal && viewCapsuleId && (
        <ViewCapsuleModal isOpen={showViewModal} closeModal={() => setShowViewModal(false)} capsuleId={viewCapsuleId} />
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingCapsule && (
          <EditCapsuleModal
            capsule={editingCapsule}
            onClose={() => setEditingCapsule(null)}
            onSaved={updateCapsule}
          />
        )}
      </AnimatePresence>

      {/* Manage modal */}
      <AnimatePresence>
        {managingCapsule && (
          <ManageCapsuleModal
            capsule={managingCapsule}
            onClose={() => setManagingCapsule(null)}
            onDelete={() => handleDelete(managingCapsule._id)}
            onEdit={() => { setEditingCapsule(managingCapsule); setManagingCapsule(null); }}
          />
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {sharingCapsule && (
          <ShareCapsuleModal
            capsule={sharingCapsule}
            onClose={() => setSharingCapsule(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
export default CapsuleListPage;
