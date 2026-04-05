// MemoriesListPage.jsx
import { useEffect, useState, useCallback } from "react";
import DiaryCard from "../components/DiaryCard";
import PhotoAlbumCard from "../components/photoAlbumCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import Navbar_Main from "../components/Navbar_main";
import { motion, AnimatePresence } from "framer-motion";
import MemoryModal from "../components/MemoryModal";
import { BookOpen, Image, LayoutGrid, Lock, Users } from "lucide-react";
import OnThisDay from "../components/OnThisDay";
import StreakCard from "../components/StreakCard";
import GroupDiary from "../components/GroupDiary";
import { DiaryEntryForm } from "../components/DiaryEntryForm";
import PhotoAlbumForm from "../components/PhotoAlbumForm";
import MobileBottomNav from "../components/MobileBottomNav";
import api from "../utils/auth";

export default function MemoriesListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [diaries, setDiaries] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [streak, setStreak] = useState(null);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [filterSecret, setFilterSecret] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [diaryRes, albumRes, streakRes] = await Promise.all([
        api.get("/diary-entries/all-diary"),
        api.get("/photo-memories/get-all-photo"),
        api.get("/diary-entries/streak"),
      ]);

      setDiaries(Array.isArray(diaryRes.data?.data) ? diaryRes.data.data : []);
      setAlbums(Array.isArray(albumRes.data?.data) ? albumRes.data.data : []);
      setStreak(streakRes.data?.data ?? null);
    } catch (err) {
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchData]);

  const handleAlbumDelete = (id) => setAlbums((prev) => prev.filter((x) => x._id !== id));
  const handleDiariesDelete = (id) => setDiaries((prev) => prev.filter((x) => x._id !== id));

  const handleCreate = (newItem) => {
    if (!newItem) return;

    if (newItem.photos) {
      setAlbums((prev) => [newItem, ...prev]);
    } else {
      setDiaries((prev) => [newItem, ...prev]);
    }
  };

  const filteredData = () => {
    let base = [];

    if (activeTab === "all") base = [...diaries, ...albums];
    if (activeTab === "diaries") base = diaries;
    if (activeTab === "photos") base = albums;

    if (filterSecret) {
      base = base.filter((item) => item.isSecret);
    }

    return base;
  };

  const TABS = [
    { key: "all", label: "All", icon: LayoutGrid },
    { key: "diaries", label: "Diary Entries", icon: BookOpen },
    { key: "photos", label: "Photo Albums", icon: Image },
    { key: "groups", label: "Groups", icon: Users },
  ];

  const secretCount = diaries.filter((d) => d.isSecret).length;
  const totalCount = diaries.length + albums.length;

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg,#f0f4ff 0%,#fdf4ff 50%,#f0fff4 100%)",
        }}
      >
        <Navbar_Main />
        <MobileBottomNav />

        <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="mb-6 text-center">
            <h1 className="chewy text-4xl bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent mb-1">
              My Memories ✧･ﾟ
            </h1>
            <p className="text-sm text-gray-400 quicksand">
              {totalCount} memor{totalCount !== 1 ? "ies" : "y"} saved
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap gap-2">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                        activeTab === key
                          ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-md"
                          : "bg-white text-gray-500 hover:bg-violet-50 border border-violet-100"
                      }`}
                    >
                      <Icon size={14} />
                      {label}

                      {key === "diaries" && diaries.length > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeTab === key
                              ? "bg-white/20 text-white"
                              : "bg-violet-100 text-violet-600"
                          }`}
                        >
                          {diaries.length}
                        </span>
                      )}

                      {key === "photos" && albums.length > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeTab === key
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {albums.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {secretCount > 0 && activeTab !== "groups" && (
                    <button
                      onClick={() => setFilterSecret((f) => !f)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        filterSecret
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white border-purple-200 text-purple-600"
                      }`}
                    >
                      <Lock size={11} /> Secret ({secretCount})
                    </button>
                  )}

                  {activeTab !== "groups" && (
                    <button
                      onClick={() =>
                        activeTab === "photos" ? setShowPhotoForm(true) : setShowDiaryForm(true)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:scale-105 transition-all shadow-md"
                      style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                    >
                      + New {activeTab === "photos" ? "Album" : "Entry"}
                    </button>
                  )}
                </div>
              </div>

              {activeTab === "groups" ? (
                <GroupDiary />
              ) : loading ? (
                <div className="flex justify-center py-20">
                  <Spinner />
                </div>
              ) : filteredData().length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">{filterSecret ? "🔒" : "✨"}</div>
                  <p className="text-lg font-semibold text-gray-500 quicksand">
                    {filterSecret ? "No secret entries" : "No memories yet"}
                  </p>
                  <p className="text-sm text-gray-400 quicksand mt-1">
                    {filterSecret
                      ? "Create a secret diary entry to see it here"
                      : "Start by adding a diary entry or photo album!"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeTab}-${filterSecret}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  {filteredData().map((item) =>
                    item.photos ? (
                      <PhotoAlbumCard
                        key={item._id}
                        album={item}
                        onDelete={handleAlbumDelete}
                        onView={() => {
                          setSelectedMemory(item);
                          setSelectedType("photo");
                        }}
                        onShare={(id) => console.log("share", id)}
                      />
                    ) : (
                      <DiaryCard
                        key={item._id}
                        entry={item}
                        onView={() => {
                          setSelectedMemory(item);
                          setSelectedType("diary");
                        }}
                        onDelete={handleDiariesDelete}
                        onShare={() => {}}
                      />
                    )
                  )}
                </motion.div>
              )}
            </div>

            <div className="xl:w-80 space-y-5 flex-shrink-0">
              {streak !== null && <StreakCard streak={streak} />}
              <OnThisDay />
            </div>
          </div>
        </div>

        <FloatingActions onCreate={handleCreate} />
      </div>

      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          type={selectedType}
          onClose={() => {
            setSelectedMemory(null);
            setSelectedType(null);
          }}
          onSave={(updated) => {
            if (selectedType === "photo") {
              setAlbums((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
            } else {
              setDiaries((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
            }
            setSelectedMemory(null);
            setSelectedType(null);
          }}
          onDelete={(id) => {
            if (selectedType === "photo") {
              handleAlbumDelete(id);
            } else {
              handleDiariesDelete(id);
            }
            setSelectedMemory(null);
            setSelectedType(null);
          }}
        />
      )}

      <AnimatePresence>
        {showDiaryForm && (
          <DiaryEntryForm
            closeForm={() => setShowDiaryForm(false)}
            onCreate={(entry) => {
              setDiaries((prev) => [entry, ...prev]);
              setShowDiaryForm(false);
            }}
          />
        )}

        {showPhotoForm && (
          <PhotoAlbumForm
            closeForm={() => setShowPhotoForm(false)}
            onCreate={(album) => {
              setAlbums((prev) => [album, ...prev]);
              setShowPhotoForm(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}