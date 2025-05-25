// MemoriesListPage.jsx
import { useEffect, useState } from "react";
import DiaryCard from "../components/DiaryCard";
import PhotoAlbumCard from "../components/photoAlbumCard";
import Spinner from "../components/Spinner";
import FloatingActions from "../components/FloatingBtn";
import TimeCapsuleModal from "../components/CreateCapsuleForm";
import Navbar_Main from "../components/Navbar_main";
import { motion, AnimatePresence } from "framer-motion";
import MemoryModal from "../components/MemoryModal";

export default function MemoriesListPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [diaries, setDiaries] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
     const [photos, setPhotos] = useState([]);  
       const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  
    const token = localStorage.getItem("token");
  const fetchData = async () => {
    setLoading(true);
    let diaryJson = null;
    let albumJson = null;
  
    try {
        const diaryRes = await fetch("http://localhost:5000/api/diary-entries/all-diary", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        diaryJson = await diaryRes.json();
        if (!diaryRes.ok) throw new Error("Failed to fetch diary entries");
        setDiaries(Array.isArray(diaryJson.data) ? diaryJson.data : []);

        const albumRes = await fetch("http://localhost:5000/api/photo-memories/get-all-photo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        albumJson = await albumRes.json();
        if (!albumRes.ok) throw new Error("Failed to fetch photo albums");
        setAlbums(Array.isArray(albumJson.data) ? albumJson.data : []);
    } catch (err) {
        console.error("Error fetching data:", err.message);
        console.log("Diary JSON:", diaryJson);
        console.log("Album JSON:", albumJson);
        setDiaries([]);
        setAlbums([]);
    } finally {
        setLoading(false);
    }
};

//     const fetchData = async () => {
//         setLoading(true);
//          setLoading(true);
//     let diaryJson = null;
//     let albumJson = null;
//         try {
//           const diaryRes = await fetch("http://localhost:5000/api/diary-entries/all-diary", {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
      
//           const diaryJson = await diaryRes.json();
//           if (!diaryRes.ok) throw new Error("Failed to fetch diary entries");
//           setDiaries(Array.isArray(diaryJson.data) ? diaryJson.data : []);
      
//           const albumRes = await fetch("http://localhost:5000/api/photo-memories/get-all-photo", {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
      
//           const albumJson = await albumRes.json();
//           if (!albumRes.ok) throw new Error("Failed to fetch photo albums");
//           setAlbums(Array.isArray(albumJson.data) ? albumJson.data : []);
//         } catch (err) {
//           console.error("Error fetching data:", err.message);
//           console.log("Diary JSON:", diaryJson);
// console.log("Album JSON:", albumJson);
//           setDiaries([]);
//           setAlbums([]);
//         } finally {
//           setLoading(false);
//         }
//       };
      
    useEffect(() => {
      fetchData();
    }, []);
  const handleAlbumDelete = (deletedId) => {
    setAlbums(albums.filter(a => a._id !== deletedId));
  };
 const handleDiariesDelete = (deletedId) => {
    setDiaries(diaries.filter(a => a._iD !== deletedId));
  };
  // edit handler
  const handleAlbumEdit = (album) => {
    // open your PhotoAlbumForm pre-filled with `album`,
    // let the user update, then update state when they save
  setEditingAlbum(album);
  };
    const handleDiaryEdit = (diaries) => {
    // open your PhotoAlbumForm pre-filled with `album`,
    // let the user update, then update state when they save
  setEditingDiary(diaries);
  };

 const handleCreate = (newItem) => {
    if (newItem.photos) {
      // it’s a photo-album
      setAlbums(a => [newItem, ...a]);
    } else {
      // it’s a diary entry
      setDiaries(d => [newItem, ...d]);
    }
  };
//   const handleCreate = () => {
//      fetchData();
//  };
  
    const filteredData = () => {
      if (activeTab === "all") return [...diaries, ...albums];
      if (activeTab === "diaries") return diaries;
      if (activeTab === "photos") return albums;
    };
  
  return (
    <>
        <div className="min-h-screen bg-[#f3f6fd] relative">
    <Navbar_Main />
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">My Memories ✧･ﾟ</h1>

      {/* Top Navigation Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {["all", "diaries", "photos"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All" : tab === "diaries" ? "Diary Entries" : "Photo Albums"}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading && <Spinner/>}

      {/* Empty State */}
      {!loading && filteredData().length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          ✨ No memories yet. Start by adding a diary or photo album!
        </div>
      )}

      {/* Memories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {!loading &&
          filteredData().map((item) =>
            item.photos ? (
              <PhotoAlbumCard key={item._id} album={item} onDelete={handleAlbumDelete}
          onView={() => {
           setSelectedMemory(item);
           setSelectedType("photo");
         }}
          onShare={(id) => console.log("share", id)} />
            ) : (
              <DiaryCard key={item._id} entry={item}   onView={() => {
           setSelectedMemory(item);
           setSelectedType("diary");
         }}
 />
            )
          )}
      </div>
    </div>
    <FloatingActions onCreate={handleCreate}/>
    </div>

      {selectedMemory && (
    <MemoryModal
      memory={selectedMemory}
      type={selectedType}       // "photo" or "diary"
      onClose={() => {
        setSelectedMemory(null);
        setSelectedType(null);
      }}
      onSave={(updated) => {
        // replace in your state arrays:
        if (selectedType === "photo") {
          setAlbums(a => a.map(x => x._id === updated._id ? updated : x));
        } else {
          setDiaries(d => d.map(x => x._id === updated._id ? updated : x));
        }
        // then close:
        setSelectedMemory(null);
        setSelectedType(null);
      }}
    />
  )}


    <AnimatePresence>
        {showForm && (
          <motion.div
          className="fixed inset-0 z-50  bg-opacity-50 flex items-center justify-center backdrop-blur-lg" // ✅ Background blur
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: "-30%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-30%", opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-4/5 max-w-lg p-6 relative" // ✅ 80% width
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
            >
         
            </button>
            <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} />
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      </>
  );
}
