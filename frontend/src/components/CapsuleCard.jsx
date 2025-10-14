// // import React from 'react';
// // import { Share2, Trash, Pencil } from 'lucide-react';
// // import { useEffect, useState } from 'react';
// // const colors = [
// //   'bg-blue-300',
// //   'bg-blue-200',
// //   'bg-teal-200',
// //   'bg-purple-200',
// //   'bg-pink-200',
// //   'bg-green-200',
// //   'bg-sky-200',
// //   'bg-indigo-200',
// // ];
// // const randomTagColor = colors[Math.floor(Math.random() * colors.length)];
// // const CapsuleCard = ({
// //   image,
// //   title,
// //   unlockTime,
// //   onManage,
// //   onDetails,
// //   sharedBy,
// //   onShare,
// //   onDelete,
// //   tags,
// //   onEdit,
// // }) => {

// //   const [timeLeft, setTimeLeft] = useState('');
// //   const [isUnlocked, setIsUnlocked] = useState(false);

// //   useEffect(() => {
// //     const unlockDate = new Date(unlockTime).getTime();

// //     const updateTimer = () => {
// //       const now = new Date().getTime();
// //       const distance = unlockDate - now;

// //       if (distance <= 0) {
// //         setIsUnlocked(true);
// //         setTimeLeft('');
// //         return;
// //       }

// //       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
// //       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
// //       const seconds = Math.floor((distance % (1000 * 60)) / 1000);

// //       setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
// //     };

// //     updateTimer(); // Run initially
// //     const interval = setInterval(updateTimer, 1000);

// //     return () => clearInterval(interval);
// //   }, [unlockTime]);
// //   return (
// //     <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl overflow-hidden shadow-md border border-[#dbeafe]  transition-all hover:shadow-2xl hover:scale-[1.02] duration-300 ease-in-out font-cursive">
// //       {/* Top-right icons */}
// //       <div className="absolute top-3 right-3 z-10 flex space-x-2">
// //         <button
// //           onClick={onEdit}
// //           className="bg-white/30 hover:bg-white/50 p-2 rounded-full shadow-md"
// //           title="Edit"
// //         >
// //           <Pencil className="w-4 h-4 text-blue-600" />
// //         </button>
// //         <button
// //           onClick={onShare}
// //           className="bg-white/30 hover:bg-white/50 p-2 rounded-full shadow-md"
// //           title="Share"
// //         >
// //           <Share2 className="w-4 h-4 text-blue-600" />
// //         </button>
// //         <button
// //           onClick={() => {
// //             const confirmDelete = window.confirm('Are you sure you want to delete this capsule? (｡•́︿•̀｡)');
// //             if (confirmDelete) {
// //               onDelete();
// //             }
// //           }}
// //           className="bg-white/30 hover:bg-pink-400/80 p-2 rounded-full shadow-md"
// //           title="Delete"
// //         >
// //           <Trash className="w-4 h-4 text-blue-600" />
// //         </button>
// //       </div>

// //       {/* Shared label */}
// //       {sharedBy && (
// //         <div className="absolute top-3 left-3 bg-pink-300 text-white text-xs px-3 py-1 rounded-full shadow">
// //           Shared by {sharedBy} (｡♥‿♥｡)
// //         </div>
// //       )}

// //       {/* Capsule image */}
// //       <img src={image} className="w-full h-45 object-cover" />

// //       {/* Content */}
// //       <div className="p-2">
// //         <h3 className="text-xl font-bold text-blue-700 truncate mb-1">{title.charAt(0).toUpperCase() + title.slice(1)} ❀</h3>
      
// //         {/* Tags */}
// //         <div className="mb-1 flex flex-wrap gap-2">
// //           {tags.map((tag, index) => (
// //             <span
// //               key={index}
// //               className={`${randomTagColor} border border-blue-200 text-blue-500 text-xs px-2 py-1 rounded-full shadow-sm`}
// //             >
// //               {tag}⋆｡
// //             </span>
// //           ))}
// //         </div>
// //         <div className="mt-2 text-md mb-3">
// //         {isUnlocked ? (
// //           <span className="text-green-600 font-semibold quicksand">🔓 Unlocked</span>
// //         ) : (
// //           <span className="text-blue-800 font-semibold quicksand italic ">⏳ Unlocks in: {timeLeft}</span>
// //         )}
// //       </div>

// //         <div className="flex justify-between items-center">
// //           <button
// //             onClick={onManage}
// //             className="bg-blue-500 font-extrabold hover:bg-blue-600 text-blue-900 px-4 py-1 rounded-xl shadow-md transition"
// //           >
// //             Manage 
// //           </button>
// //           <button
// //             onClick={onDetails}
// //             className="bg-purple-500 font-extrabold hover:bg-blue-600 text-blue-900 px-4 py-1 rounded-xl shadow-md transition"
// //           >
// //             Details
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CapsuleCard;
// // src/components/CapsuleCard.jsx

// import React, { useEffect, useState } from "react";
// import { Share2, Trash, Pencil } from "lucide-react";

// const colors = [
//   "bg-blue-300",
//   "bg-blue-200",
//   "bg-teal-200",
//   "bg-purple-200",
//   "bg-pink-200",
//   "bg-green-200",
//   "bg-sky-200",
//   "bg-indigo-200",
// ];
// const randomTagColor = colors[Math.floor(Math.random() * colors.length)];

// const CapsuleCard = ({
//   image,
//   title,
//   unlockTime,
//   onManage,
//   onDetails,
//   sharedBy,
//   onShare,
//   onDelete,
//   tags,
//   onEdit,
// }) => {
//   const [timeLeft, setTimeLeft] = useState("");
//   const [isUnlocked, setIsUnlocked] = useState(false);

//   useEffect(() => {
//     const unlockDate = new Date(unlockTime).getTime();
//     const updateTimer = () => {
//       const now = Date.now();
//       const distance = unlockDate - now;
//       if (distance <= 0) {
//         setIsUnlocked(true);
//         setTimeLeft("");
//         return;
//       }
//       const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
//     };
//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);
//     return () => clearInterval(interval);
//   }, [unlockTime]);

//   return (
//      <div className="w-[320px] sm:w-[370px] md:w-[450px] lg:w-[500px] max-w-full rounded-xl shadow-lg p-4 bg-[#e0f2ff] relative hover:shadow-blue-300 hover:scale-[1.01] transition-all duration-200 overflow-hidden font-cursive mx-auto">
      
//       {/* Edit/Delete/Share icons */}
//       <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
//         <button onClick={onEdit} className="p-1 bg-white/60 hover:bg-white rounded-full">
//           <Pencil className="w-4 h-4 text-blue-600" />
//         </button>
//         <button onClick={onShare} className="p-1 bg-white/60 hover:bg-white rounded-full">
//           <Share2 className="w-4 h-4 text-blue-600" />
//         </button>
//         <button
//           onClick={() => {
//             if (window.confirm("Delete this capsule? (；′⌒`)")) onDelete();
//           }}
//           className="p-1 bg-white/60 hover:bg-red-200 rounded-full"
//         >
//           <Trash className="w-4 h-4 text-blue-600" />
//         </button>
//       </div>

//       {/* Shared by */}
//       {sharedBy && (
//         <div className="absolute top-1.5 left-1.5 text-[15px] bg-pink-200 text-white px-2 py-0.5 rounded-full shadow">
//           Shared by {sharedBy}
//         </div>
//       )}

//       {/* Image */}
//       <img
//         src={image}
//         alt={title}
//         className="w-full h-24 sm:h-28 object-cover rounded-t-xl"
//       />

//       {/* Content */}
//       <div className="px-3 py-2 space-y-1">
//         <h3 className="text-2xl font-bold text-blue-700 truncate">{title} ❄</h3>

//         {/* Tags */}
//         {tags.length > 0 && (
//           <div className="flex flex-wrap gap-1">
//             {tags.map((tag, idx) => (
//               <span
//                 key={idx}
//                 className="bg-blue-100 text-[10px] px-2 py-0.5 rounded-full text-blue-800"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Time */}
//         <div className="text-xs italic text-blue-600">
//           {isUnlocked ? "🔓 Unlocked!" : `⏳ Unlocks in: ${timeLeft}`}
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-between pt-1">
//           <button
//             onClick={onManage}
//             className="text-[20px] px-2 py-1 rounded bg-blue-200 hover:bg-blue-300 text-blue-800"
//           >
//             Manage
//           </button>
//           <button
//             onClick={onDetails}
//             className="text-[20px] px-2 py-1 rounded bg-purple-200 hover:bg-purple-300 text-blue-800"
//           >
//             Details
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CapsuleCard;
// src/components/CapsuleCard.jsx
// src/components/CapsuleCard.jsx

// src/components/CapsuleCard.jsx
// src/components/CapsuleCard.jsx

import React, { useEffect, useState } from "react";
import { Share2, Trash, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define pairs of distinct HEX colors (compatible with a blue-themed look)
const colorPairs = [
  ["#60A5FA", "#F472B6"], // light blue & pink
  ["#38BDF8", "#FDE68A"], // sky blue & yellow
  ["#818CF8", "#A78BFA"], // indigo & violet
  ["#34D399", "#93C5FD"], // teal & light blue
  ["#F472B6", "#60A5FA"], // pink & light blue
  ["#FBBF24", "#3B82F6"], // amber & blue
];

const CapsuleCard = ({
  image,
  title,
  description,
  unlockTime,
  onManage,
  onDetails,
  sharedBy,
  onShare,
  onDelete,
  tags,
  onEdit,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Pick one random pair of top/bottom HEX colors on mount
  const [chosenPair] = useState(() => {
    return colorPairs[Math.floor(Math.random() * colorPairs.length)];
  });
  const [colorTop, colorBottom] = chosenPair;

  useEffect(() => {
    const unlockDate = new Date(unlockTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const distance = unlockDate - now;
      if (distance <= 0) {
        setIsUnlocked(true);
        setTimeLeft("");
        return;
      }
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [unlockTime]);

  const isLocked = !isUnlocked;

  // Only flip if unlocked
  const handleFlip = () => {
    if (isUnlocked) {
      setFlipped((prev) => !prev);
    }
  };

  return (
   <div
  className="inline-block cursor-pointer"
  style={{ perspective: 1000 }}
  onClick={handleFlip}
>
  <motion.div
    animate={{ rotateY: flipped ? 180 : 0 }}
    transition={{ type: "spring", stiffness: 180, damping: 15 }}
    style={{ transformStyle: "preserve-3d" }}
    className="relative w-[180px] h-[360px]"
  >
        {/* === FRONT SIDE OF CAPSULE === */}
        <div
          className="absolute inset-0 rounded-full shadow-xl overflow-hidden flex flex-col items-center justify-between p-0 font-cursive"
          style={{ transform: "rotateY(0deg)", // <== Forces front to always face forward
  backfaceVisibility: "hidden",
  zIndex: 2,
 }}
        >
          {/* Top Half & Bottom Half with distinct HEX */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-1/2"
              style={{ backgroundColor: colorTop }}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-1/2"
              style={{ backgroundColor: colorBottom }}
            />
          </div>

          {/* Edit/Delete/Share icons */}
          <div className="absolute top-15 left-1.5 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 bg-white/60 hover:bg-white rounded-full"
            >
              <Pencil className="w-4 h-4 text-blue-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-1 bg-white/60 hover:bg-white rounded-full"
            >
              <Share2 className="w-4 h-4 text-blue-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this capsule? (；′⌒`)")) onDelete();
              }}
              className="p-1 bg-white/60 hover:bg-red-200 rounded-full"
            >
              <Trash className="w-4 h-4 text-blue-900" />
            </button>
          </div>

          {/* Shared by */}
          {/* {sharedBy && (
            <div className="absolute top-2 right-2 text-[12px] bg-pink-200 text-white px-2 py-0.5 rounded-full shadow">
              Shared by {sharedBy}
            </div>
          )} */}

          {/* Title */}
          <div className="text-center mt-6 px-2 z-10">
            <h3 className="text-xl font-bold text-blue-900 break-words">
              {title}
            </h3>
          </div>

          {/* Center Circle: Status & Tags */}
          <div className="z-10 relative">
            <div className="w-[90px] h-[90px] rounded-full bg-white border-4 border-blue-300 shadow-md flex flex-col items-center justify-center text-center text-[12px] px-1">
              <span className="font-bold text-blue-900">
                {isLocked ? "🔒 Locked" : "🔓 Unlocked"}
              </span>
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                {tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-[10px] px-2 py-0.5 rounded-full text-blue-900"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Manage / Details Buttons */}
          <div className="flex flex-col gap-2 items-center mb-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
              className="text-[14px] px-3 py-1 rounded-full bg-[#93C5FD] hover:bg-[#60A5FA] text-blue-900"
            >
              Manage
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
              className="text-[14px] px-3 py-1 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-blue-900"
            >
              Details
            </button>
          </div>

          {/* Burst-open background image overlay when unlocked */}
          <AnimatePresence>
            {isUnlocked && (
              <motion.img
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 0.15, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={image}
                alt="Capsule background"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-full pointer-events-none blur-sm"
                style={{ backfaceVisibility: "hidden" }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* === BACK SIDE (PREVIEW) === */}
     <div
      className="absolute inset-0 bg-white shadow-lg p-4 flex flex-col items-center justify-start"
      style={{
        transform: "rotateY(180deg)",
  backfaceVisibility: "hidden",
  zIndex: 1,
      }}
    >
  {/* Inner wrapper to prevent content from being mirrored 
  {/* <div style={{transform: "rotateY(180deg)", width: "100%" }}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setFlipped(false);
      }}
      className="self-end text-blue-700 hover:text-red-500 mb-2"
    >
      <X className="w-5 h-5" />
    </button>

    <img
      src={image}
      alt={title}
      className="w-full h-40 object-cover rounded-lg mb-3"
    />
    <h2 className="text-xl font-bold text-blue-800 mb-2">{title}</h2>
    <div className="flex flex-wrap gap-1 mb-3">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="bg-blue-100 text-[10px] px-2 py-0.5 rounded-full text-blue-800"
        >
          {tag}
        </span>
      ))}
    </div>
    <p className="text-sm italic text-gray-600 mb-4">
      {description}
    </p>
    <div className="mt-auto w-full flex justify-center gap-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onManage();
          setFlipped(false);
        }}
        className="text-[14px] px-3 py-1 rounded-full bg-[#93C5FD] hover:bg-[#60A5FA] text-blue-900"
      >
        Manage
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetails();
          setFlipped(false);
        }}
        className="text-[14px] px-3 py-1 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-blue-900"
      >
        Details
      </button>
    </div> */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFlipped(false);
        }}
        className="self-end  text-blue-700 hover:text-red-500  mb-2"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={image}
        alt={title}
        className="w-full h-20 object-cover rounded-lg mb-3"
      />
       <div className="absolute top-36 left-1.5 flex flex-col gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 bg-white/60 hover:bg-white rounded-full"
            >
              <Pencil className="w-4 h-4 text-blue-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-1 bg-white/60 hover:bg-white rounded-full"
            >
              <Share2 className="w-4 h-4 text-blue-900" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this capsule? (；′⌒`)")) onDelete();
              }}
              className="p-1 bg-white/60 hover:bg-red-200 rounded-full"
            >
              <Trash className="w-4 h-4 text-blue-900" />
            </button>
          </div>
      <h2 className="text-xl font-bold text-blue-800 mb-2">{title}</h2>
      <p className="text-sm italic text-gray-600 mb-4">{description}</p>
      <div className="mt-auto w-full flex justify-center  gap-2 items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onManage();
            setFlipped(false);
          }}
          className="text-sm px-3 py-1 rounded-full bg-blue-300 text-blue-900"
        >
          Manage
        </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
              className="text-[14px] px-3 py-1 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-blue-900"
            >
              Details
            </button>
 </div>
</div>
      </motion.div>
    </div>
  );
};

export default CapsuleCard;
