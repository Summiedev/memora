import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar_Main from "../components/Navbar_main";
import CapsuleList from "../components/CapsuleList";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import { motion, AnimatePresence } from "framer-motion";

const CapsuleListPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const addCapsule = newCapsule =>
    setCapsules(prev => [newCapsule, ...prev]);

  const removeCapsule = id =>
    setCapsules(prev => prev.filter(c => c._id !== id));

  // Derived and memoized filtered + sorted capsules
  const filteredCapsules = useMemo(() => {
    let list = [...capsules];

    // search filter (by title or tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // sorting
    list.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return new Date(a.sendDate) - new Date(b.sendDate);
        case "atoz":
          return a.title.localeCompare(b.title);
        case "tags":
          // sort by first tag alphabetically
          return (
            (a.tags?.[0] || "").localeCompare(b.tags?.[0] || "")
          );
        case "recent":
        default:
          return new Date(b.sendDate) - new Date(a.sendDate);
      }
    });

    return list;
  }, [capsules, searchQuery, sortOption]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 relative">
        <Navbar_Main />

        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-6 bg-blue-800 text-white shadow-lg rounded-b-3xl">
          <h1 className="text-3xl font-extrabold tracking-wide leading-tight">
            ✧ Time Capsules ✧
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search capsules..."
              className="px-4 py-2 w-full md:w-64 rounded-xl bg-blue-700 placeholder-blue-200 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <select
              name="filter"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="px-4 py-2 rounded-xl bg-blue-700 text-white border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="recent">Recently Created</option>
              <option value="oldest">Oldest First</option>
              <option value="atoz">A to Z</option>
              <option value="tags">By First Tag</option>
            </select>
          </div>
        </header>

        {/* Capsules Grid */}
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-700">
              Your Capsules ({filteredCapsules.length})
            </h2>
            <p className="text-blue-500 italic">
              Click any capsule to view or manage
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : (
            <CapsuleList
              capsules={filteredCapsules}
              addCapsule={addCapsule}
              removeCapsule={removeCapsule}
            />
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
              className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-8 relative"
              initial={{ y: "-20%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-20%", opacity: 0 }}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
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
    </>
  );
};

export default CapsuleListPage;
