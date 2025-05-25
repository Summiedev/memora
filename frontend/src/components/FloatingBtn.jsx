import { useState,useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimeCapsuleModal from "./CreateCapsuleForm";
import PhotoAlbumForm from "./PhotoAlbumForm";
import { DiaryEntryForm } from "./DiaryEntryForm";

const FloatingActions = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [memoryType, setMemoryType] = useState(null);
  const [openMemory, setOpenMemory] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  
  const memoryModalRef = useRef();
  const capsuleModalRef = useRef();

  const handleOpenMemory = () => {
    setOpenMemory(true);
    setMemoryType(null); // reset just in case
  };

  const handleMemoryType = (type) => {
    setMemoryType(type);
  };

  const handleClose = () => {
    setOpenMemory(false);
    setMemoryType(null);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMemory &&
        memoryModalRef.current &&
        !memoryModalRef.current.contains(event.target)
      ) {
        handleClose();
      }
  
      if (
        showForm &&
        capsuleModalRef.current &&
        !capsuleModalRef.current.contains(event.target)
      ) {
        setShowForm(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMemory, showForm]);
  
  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50"
      onMouseLeave={() => setOpen(false)}
      >
        <div className="relative flex items-end justify-end">
          {/* Popup Buttons */}
          <div className="absolute w-[200px] bottom-16 right-0 flex flex-col items-end space-y-2 transition-all duration-300">
            <button
              onClick={() => setShowForm(true)}
              className={`bg-pink-500 hover:bg-pink-700 text-white text-xl font-bold px-2 mb-8 py-2 rounded-xl shadow-lg transition transform ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              ❀⋆｡˚ Create New Capsule ❀⋆｡˚
            </button>
            <button
              onClick={() => setOpenMemory(true)}
              className={`bg-blue-400 hover:bg-blue-700 text-white mb-8 font-bold text-xl px-2 py-2 rounded-xl shadow-lg transition transform ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              ❀⋆｡˚ Create New Memory ❀⋆｡˚
            </button>
          </div>

          {/* Main FAB */}
            <button
      className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl"
      onMouseEnter={() => setOpen(true)}

    >
      <Plus size={27} />
    </button>
         
        </div>
      </div>

    {/* Memory Type Modal */}
    {openMemory && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex justify-center items-center p-2">
          <div
            ref={memoryModalRef}
            className={`relative bg-white rounded-2xl shadow-2xl p-4 w-full max-w-4xl overflow-y-auto font-cute transition-all duration-300
            ${memoryType ? "h-full sm:h-[90%] md:h-[80%] md:w-[65%]" : "w-[90%] max-w-md border-4 border-blue-200"}`}
          >
            {/* Modal Content */}
            {!memoryType ? (
              <>
                <h2 className="text-center text-xl font-semibold mb-4 text-blue-700">
                  Choose Your Memory Style ✧･ﾟ
                </h2>

                <div className="grid gap-4">
                  <button
                    onClick={() => handleMemoryType("photo")}
                    className="bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-800 font-medium px-4 py-3 rounded-lg shadow-inner transition"
                  >
                    ⋆ Photo Album Mode
                    <p className="text-sm text-blue-600 mt-1">Upload pictures & captions ⋆｡°✩</p>
                  </button>

                  <button
                    onClick={() => handleMemoryType("diary")}
                    className="bg-pink-100 hover:bg-pink-200 border border-pink-400 text-pink-800 font-medium px-4 py-3 rounded-lg shadow-inner transition"
                  >
                    ⋆ Diary Mode
                    <p className="text-sm text-pink-600 mt-1">Handwritten-style memory ✿˖°</p>
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full overflow-y-auto">
               {memoryType === "photo" && (
                  // <PhotoAlbumForm 
                  //   onSave={() => {
                  //     onCreate(); // Trigger parent component to refresh
                  //     handleClose();
                  //   }} 
                  //   closeForm={handleClose} 
                  // />
               <PhotoAlbumForm
  closeForm={handleClose}
   onCreate={(newItem) => {
    onCreate(newItem);    // <-- forward the created object
      handleClose();
    }}
  />
                )}
                
                {memoryType === "diary" && (
                  <DiaryEntryForm
    closeForm={handleClose}
   onCreate={(newItem) => {
      onCreate(newItem);    // <-- forward the created object
     handleClose();
    }}
 />
                  // <DiaryEntryForm
                  //   onSave={() => {
                  //     onCreate(); // Trigger parent component to refresh
                  //     handleClose();
                  //   }}
                  //   closeForm={handleClose}
                  // />
                )}
              </div>
            )}


         
          </div>
        </div>
      )}

      {/* Capsule Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
          
            className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
            
              initial={{ y: "-30%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-30%", opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-4/5 max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              >
                <X />
              </button>
              <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} addCapsule={onCreate} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingActions;
