import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar_Main from "../components/Navbar_main";
import CapsuleCard from "../components/CapsuleCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import { motion, AnimatePresence } from "framer-motion";
import ViewCapsuleModal from "../components/ViewCapsuleModal";
import { Search, SlidersHorizontal, Package } from "lucide-react";

const CapsuleListPage = () => {
  const [showForm, setShowForm]           = useState(false);
  const [capsules, setCapsules]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [viewCapsuleId, setViewCapsuleId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [sortOption, setSortOption]       = useState("recent");
  const token = localStorage.getItem("token");

  const fetchCapsules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/capsules/all-capsules",
        { headers: { Authorization: `Bearer ${token}` } });
      setCapsules(res.data.capsules);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCapsules(); }, []);

  const addCapsule    = c  => setCapsules(p => [c, ...p]);
  const removeCapsule = id => setCapsules(p => p.filter(c => c._id !== id));

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/capsules/delete-capsule/${id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      removeCapsule(id);
    } catch (e) { console.error(e); }
  };

  const filteredCapsules = useMemo(() => {
    let list = [...capsules];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    list.sort((a, b) => {
      switch (sortOption) {
        case "oldest": return new Date(a.sendDate) - new Date(b.sendDate);
        case "atoz":   return a.title.localeCompare(b.title);
        case "tags":   return (a.tags?.[0]||"").localeCompare(b.tags?.[0]||"");
        default:       return new Date(b.sendDate) - new Date(a.sendDate);
      }
    });
    return list;
  }, [capsules, searchQuery, sortOption]);

  return (
    <>
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#fce4f3 0%,#ede9ff 40%,#dbeafe 100%)" }}>
        <Navbar_Main />

        {/* Page header */}
        <div className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6,#3b82f6)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%,white 1px,transparent 1px),radial-gradient(circle at 80% 20%,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div>
                  <h1 className="chewy text-4xl text-white drop-shadow mb-1">✦ My Time Capsules</h1>
                  <p className="text-pink-100 text-sm font-medium">Every memory sealed with love 💌</p>
                </div>
                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search capsules…"
                      className="pl-9 pr-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-full sm:w-56" />
                  </div>
                  <div className="relative">
                    <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                    <select value={sortOption} onChange={e => setSortOption(e.target.value)}
                      className="pl-8 pr-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm appearance-none cursor-pointer">
                      <option value="recent" className="text-gray-800">Recently Created</option>
                      <option value="oldest" className="text-gray-800">Oldest First</option>
                      <option value="atoz"   className="text-gray-800">A to Z</option>
                      <option value="tags"   className="text-gray-800">By First Tag</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-purple-500" />
              <h2 className="text-lg font-bold text-purple-700">
                {filteredCapsules.length} capsule{filteredCapsules.length !== 1 ? 's' : ''}
                {searchQuery && <span className="text-sm text-purple-400 font-normal ml-1">for "{searchQuery}"</span>}
              </h2>
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-pink-500 hover:text-pink-700 font-medium transition-colors">
                Clear ×
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
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    onManage={() => {}}
                    onDetails={() => { setViewCapsuleId(capsule._id); setShowViewModal(true); }}
                    sharedBy={capsule.sharedBy}
                    onShare={() => {}}
                    onDelete={() => { removeCapsule(capsule._id); handleDelete(capsule._id); }}
                    onEdit={() => {}}
                    tags={capsule.tags || []}
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

      {showViewModal && viewCapsuleId && (
        <ViewCapsuleModal isOpen={showViewModal} closeModal={() => setShowViewModal(false)} capsuleId={viewCapsuleId} />
      )}
    </>
  );
};
export default CapsuleListPage;
