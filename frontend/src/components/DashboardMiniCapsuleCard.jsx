// import { motion } from 'framer-motion';

// const MiniCapsule = ({ title, date, description, tags, status }) => {
//    const isLocked = status.toLowerCase() === 'locked';

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className="w-[270px] bg-gradient-to-br from-[#e0f2ff] to-[#f2f7ff] rounded-2xl p-4 shadow-md border border-[#dbeafe] flex flex-col justify-between h-[200px] transition-all"
//     >
//       {/* Top section: Title and date */}
//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-semibold quicksand text-lg text-indigo-600 overflow-hidden text-ellipsis whitespace-normal break-words">
//             {title}
//           </h3>
//           <span className="text-xs text-gray-400">{date}</span>
//         </div>
//         <p className="text-sm text-gray-600 font-medium mb-3 quicksand overflow-hidden text-ellipsis whitespace-normal break-words">
//         {isLocked
//             ? "Content can't be displayed"
//             : description}
//         </p>
//       </div>

//       {/* Bottom section: Tags and Status */}
//       <div className="mt-auto">
//         <div className="flex flex-wrap gap-2 text-xs mb-2">
//           {tags.map((tag, index) => (
//             <span
//               key={index}
//               className={`${
//                 tag.includes('Family') ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-500'
//               } px-2 py-1 rounded-full`}
//             >
//               {tag}
//             </span>
//           ))}
//         </div>
//         <div className="text-right text-gray-400 text-sm">{status}</div>
//       </div>
//     </motion.div>
//   );
// };

// export default MiniCapsule;
import { motion } from 'framer-motion';

const MiniCapsule = ({ title, date, description, tags, status }) => {
  const isLocked = status.toLowerCase() === 'locked';

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className={`w-[270px] h-[210px] px-4 py-3 rounded-2xl shadow-lg relative overflow-hidden
        flex flex-col justify-between border transition-all
        ${
          isLocked
            ? 'bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] border-slate-200'
            : 'bg-gradient-to-r from-[#ecfdf5] via-[#e0f2fe] to-[#f0f9ff] border-[#cbd5e1]'
        }`}
    >
      {/* Optional glowing border effect */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-2xl border border-transparent pointer-events-none"
      />

      {/* Top: Title + Date */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-base text-sky-800 truncate">{title}</h3>
          {!isLocked && (
            <span className="text-[11px] text-gray-500">{date}</span>
          )}
        </div>
        <div>
          {isLocked ? (
            <p className="italic text-sm text-gray-400">🔒 This capsule is locked</p>
          ) : (
            <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
          )}
        </div>
      </div>

      {/* Bottom: Tags + Status */}
      <div className="mt-auto">
        {!isLocked && (
          <div className="flex flex-wrap gap-1 mt-2 text-xs">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 rounded-full font-medium
                  ${
                    tag.toLowerCase().includes('family')
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-rose-100 text-rose-600'
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-right text-[11px] text-gray-400 mt-2">{status}</div>
      </div>
    </motion.div>
  );
};

export default MiniCapsule;
