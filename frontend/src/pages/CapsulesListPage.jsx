// // src/pages/CapsuleListPage.jsx

// src/pages/CapsuleListPage.jsx

// src/pages/CapsuleListPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar_Main from "../components/Navbar_main";
import CapsuleCard from "../components/CapsuleCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import { motion, AnimatePresence } from "framer-motion";
import ViewCapsuleModal from "../components/ViewCapsuleModal";

const CapsuleListPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewCapsuleId, setViewCapsuleId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const token = localStorage.getItem("token");

  const fetchCapsules = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/capsules/all-capsules",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCapsules(res.data.capsules);
    } catch (error) {
      console.error("Error fetching capsules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const addCapsule = (newCapsule) =>
    setCapsules((prev) => [newCapsule, ...prev]);

  const removeCapsule = (id) =>
    setCapsules((prev) => prev.filter((c) => c._id !== id));

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/capsules/delete-capsule/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      removeCapsule(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
    const handleShare = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/capsules/${_id}/share`,
        {}, // no body needed; server uses capsule.sharedWith[]
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('🟢 Capsule shared with all designated friends.');
      onShareSuccess?.(); // e.g. re‐fetch or re‐render
    } catch (err) {
      console.error('Share failed', err);
      alert('⚠️ Failed to share capsule.');
    }
  };

  const handleUnshare = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/capsules/${_id}/share`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('🟢 Capsule removed from your shared list.');
      onUnshareSuccess?.();
    } catch (err) {
      console.error('Unshare failed', err);
      alert('⚠️ Failed to remove shared capsule.');
    }
  };

  const filteredCapsules = useMemo(() => {
    let list = [...capsules];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    list.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return new Date(a.sendDate) - new Date(b.sendDate);
        case "atoz":
          return a.title.localeCompare(b.title);
        case "tags":
          return (a.tags?.[0] || "").localeCompare(b.tags?.[0] || "");
        case "recent":
        default:
          return new Date(b.sendDate) - new Date(a.sendDate);
      }
    });

    return list;
  }, [capsules, searchQuery, sortOption]);
console.log("Filtered Capsules:", filteredCapsules);
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <Navbar_Main />

        {/* Header */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-6 bg-blue-800 text-white shadow-lg rounded-b-3xl">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            ✧ Time Capsules ✧
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search capsules..."
              className="px-4 py-2 w-full md:w-64 rounded-full bg-blue-700 placeholder-blue-200 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <select
              name="filter"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 w-full md:w-48 rounded-full bg-blue-700 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="recent">Recently Created</option>
              <option value="oldest">Oldest First</option>
              <option value="atoz">A to Z</option>
              <option value="tags">By First Tag</option>
            </select>
          </div>
        </header>

        {/* Capsule Grid */}
        <main className="p-6 lg:px-12 lg:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-700 mb-2 md:mb-0">
              Your Capsules ({filteredCapsules.length})
            </h2>
            <p className="text-blue-500 italic text-sm">
              Tap any capsule to open
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCapsules.map((capsule, idx) => (
                <motion.div
                  key={capsule._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 20,
                    delay: idx * 0.08,
                  }}
                  className="flex justify-center"
                >
                  <CapsuleCard
                    image={capsule.coverImage || "/placeholder.png"}
                    title={capsule.title}
                    description={capsule.message}
                    unlockTime={capsule.sendDate}
                    onManage={() => {
                      /* unchanged logic */
                    }}
                    onDetails={() => {
                      setViewCapsuleId(capsule._id);
                      setShowViewModal(true);
                    }}
                    sharedBy={capsule.sharedBy}
                    onShare={() => {
                      /* unchanged logic */
                    }}
                    onDelete={() => {
                      removeCapsule(capsule._id);
                      handleDelete(capsule._id);
                    }}
                    onEdit={() => {
                      /* unchanged logic */
                    }}
                    tags={capsule.tags || []}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </main>

        {/* Floating Create Button */}
        <FloatingActions onCreate={() => setShowForm(true)} />
      </div>

      {/* Create Capsule Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg p-8 relative"
              initial={{ y: "-20%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-20%", opacity: 0 }}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
              >
                &times;
              </button>

              <TimeCapsuleModal
                isOpen={showForm}
                closeModal={() => setShowForm(false)}
                addCapsule={addCapsule}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Capsule Modal */}
      {showViewModal && viewCapsuleId && (
        <ViewCapsuleModal
          isOpen={showViewModal}
          closeModal={() => setShowViewModal(false)}
          capsuleId={viewCapsuleId}
        />
      )}
    </>
  );
};

export default CapsuleListPage;

