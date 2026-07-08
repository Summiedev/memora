import { useState, useRef } from "react";
import { Plus, X, Camera, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimeCapsuleModal from "./CreateCapsuleForm";
import PhotoAlbumForm from "./PhotoAlbumForm";
import { DiaryEntryForm } from "./DiaryEntryForm";

const FloatingActions = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [memoryType, setMemoryType] = useState(null);
  const [openMemory, setOpenMemory] = useState(false);
  
  const memoryModalRef = useRef();

  const handleMemoryType = (type) => {
    setMemoryType(type);
  };

  const handleClose = () => {
    setOpenMemory(false);
    setMemoryType(null);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative flex items-end justify-end">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-20 right-0 flex flex-col items-end space-y-3"
              >
                <button
                  onClick={() => { setShowForm(true); setOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}
                >
                  <X size={14} className="rotate-45" /> New Capsule
                </button>
                <button
                  onClick={() => { setOpenMemory(true); setOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}
                >
                  <Camera size={14} /> New Memory
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(v => !v)}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}
          >
            <motion.div
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Plus size={28} className="text-white" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {openMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex justify-center items-center p-4"
            onClick={e => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              ref={memoryModalRef}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="chewy text-xl text-purple-700">Create a Memory</h2>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={() => handleMemoryType("photo")}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Camera size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-700">Photo Album</p>
                      <p className="text-xs text-blue-500 mt-0.5">Upload pictures with captions</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMemoryType("diary")}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-pink-100 bg-pink-50 hover:bg-pink-100 hover:border-pink-200 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                      <Pencil size={20} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pink-700">Diary Entry</p>
                      <p className="text-xs text-pink-500 mt-0.5">Write a handwritten-style memory</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
              <div className="p-6 relative">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
                >
                  <X size={16} className="text-gray-500" />
                </button>
                <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} addCapsule={onCreate} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActions;