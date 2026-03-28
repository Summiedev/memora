// MemoriesListPage.jsx — fixed bugs + improved UI
import { useEffect, useState } from "react";
import DiaryCard from "../components/DiaryCard";
import PhotoAlbumCard from "../components/photoAlbumCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import Navbar_Main from "../components/Navbar_main";
import { motion, AnimatePresence } from "framer-motion";
import MemoryModal from "../components/MemoryModal";
import { BookOpen, Image, LayoutGrid, X } from "lucide-react";

export default function MemoriesListPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [diaries,   setDiaries]   = useState([]);
  const [albums,    setAlbums]     = useState([]);
  const [showForm,  setShowForm]   = useState(false);
  const [loading,   setLoading]    = useState(true);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedType,   setSelectedType]   = useState(null);

  // ── fix: declare editing state that handlers actually use ──────────────
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editingDiary, setEditingDiary] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [diaryRes, albumRes] = await Promise.all([
        fetch("http://localhost:5000/api/diary-entries/all-diary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/photo-memories/get-all-photo", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const diaryJson = await diaryRes.json();
      const albumJson = await albumRes.json();

      setDiaries(Array.isArray(diaryJson.data) ? diaryJson.data : []);
      setAlbums(Array.isArray(albumJson.data)  ? albumJson.data  : []);
    } catch (err) {
      console.error("Error fetching memories:", err.message);
      setDiaries([]);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAlbumDelete  = (id)    => setAlbums(a  => a.filter(x => x._id !== id));
  // fix: use _id not _iD
  const handleDiariesDelete = (id)   => setDiaries(d => d.filter(x => x._id !== id));

  const handleAlbumEdit = (album)    => setEditingAlbum(album);
  const handleDiaryEdit = (diary)    => setEditingDiary(diary);

  const handleCreate = (newItem) => {
    if (newItem.photos) setAlbums(a  => [newItem, ...a]);
    else                setDiaries(d => [newItem, ...d]);
  };

  const filteredData = () => {
    if (activeTab === "all")     return [...diaries, ...albums];
    if (activeTab === "diaries") return diaries;
    if (activeTab === "photos")  return albums;
    return [];
  };

  const TABS = [
    { key: "all",     label: "All",          icon: LayoutGrid },
    { key: "diaries", label: "Diary Entries", icon: BookOpen  },
    { key: "photos",  label: "Photo Albums",  icon: Image     },
  ];

  return (
    <>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#f0f4ff 0%,#fdf4ff 50%,#f0fff4 100%)" }}>
        <Navbar_Main />

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── Header ── */}
          <div className="mb-8 text-center">
            <h1 className="chewy text-4xl bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent mb-1">
              My Memories ✧･ﾟ
            </h1>
            <p className="text-sm text-gray-400 quicksand">
              {diaries.length + albums.length} memory{diaries.length + albums.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {/* ── Tabs ── */}
          <div className="flex justify-center gap-2 mb-8">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold quicksand transition-all duration-200 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-md shadow-violet-200"
                    : "bg-white text-gray-500 hover:bg-violet-50 hover:text-violet-600 border border-violet-100"
                }`}
              >
                <Icon size={15} />
                {label}
                {key === "diaries" && diaries.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === key ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"
                  }`}>{diaries.length}</span>
                )}
                {key === "photos" && albums.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === key ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                  }`}>{albums.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : filteredData().length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg font-semibold text-gray-500 quicksand">No memories yet</p>
              <p className="text-sm text-gray-400 quicksand mt-1">
                Start by adding a diary entry or photo album!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5"
            >
              {filteredData().map((item) =>
                item.photos ? (
                  <PhotoAlbumCard
                    key={item._id}
                    album={item}
                    onDelete={handleAlbumDelete}
                    onView={() => { setSelectedMemory(item); setSelectedType("photo"); }}
                    onShare={(id) => console.log("share", id)}
                  />
                ) : (
                  <DiaryCard
                    key={item._id}
                    entry={item}
                    onView={() => { setSelectedMemory(item); setSelectedType("diary"); }}
                  />
                )
              )}
            </motion.div>
          )}
        </div>

        <FloatingActions onCreate={handleCreate} />
      </div>

      {/* ── Memory Modal ── */}
      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          type={selectedType}
          onClose={() => { setSelectedMemory(null); setSelectedType(null); }}
          onSave={(updated) => {
            if (selectedType === "photo") setAlbums(a  => a.map(x => x._id === updated._id ? updated : x));
            else                          setDiaries(d => d.map(x => x._id === updated._id ? updated : x));
            setSelectedMemory(null);
            setSelectedType(null);
          }}
        />
      )}

      {/* ── Capsule Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "-20%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{   y: "-20%", opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
              <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
