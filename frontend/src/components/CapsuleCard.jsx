import React from 'react';
import { Share2, Trash, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
const colors = [
  'bg-blue-300',
  'bg-blue-200',
  'bg-teal-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-green-200',
  'bg-sky-200',
  'bg-indigo-200',
];
const randomTagColor = colors[Math.floor(Math.random() * colors.length)];
const CapsuleCard = ({
  image,
  title,
  unlockTime,
  onManage,
  onDetails,
  sharedBy,
  onShare,
  onDelete,
  tags,
  onEdit,
}) => {

  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlockDate = new Date(unlockTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = unlockDate - now;

      if (distance <= 0) {
        setIsUnlocked(true);
        setTimeLeft('');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer(); // Run initially
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);
  return (
    <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl overflow-hidden shadow-md border border-[#dbeafe]  transition-all hover:shadow-2xl hover:scale-[1.02] duration-300 ease-in-out font-cursive">
      {/* Top-right icons */}
      <div className="absolute top-3 right-3 z-10 flex space-x-2">
        <button
          onClick={onEdit}
          className="bg-white/30 hover:bg-white/50 p-2 rounded-full shadow-md"
          title="Edit"
        >
          <Pencil className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={onShare}
          className="bg-white/30 hover:bg-white/50 p-2 rounded-full shadow-md"
          title="Share"
        >
          <Share2 className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={() => {
            const confirmDelete = window.confirm('Are you sure you want to delete this capsule? (｡•́︿•̀｡)');
            if (confirmDelete) {
              onDelete();
            }
          }}
          className="bg-white/30 hover:bg-pink-400/80 p-2 rounded-full shadow-md"
          title="Delete"
        >
          <Trash className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Shared label */}
      {sharedBy && (
        <div className="absolute top-3 left-3 bg-pink-300 text-white text-xs px-3 py-1 rounded-full shadow">
          Shared by {sharedBy} (｡♥‿♥｡)
        </div>
      )}

      {/* Capsule image */}
      <img src={image} className="w-full h-45 object-cover" />

      {/* Content */}
      <div className="p-2">
        <h3 className="text-xl font-bold text-blue-700 truncate mb-1">{title.charAt(0).toUpperCase() + title.slice(1)} ❀</h3>
      
        {/* Tags */}
        <div className="mb-1 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`${randomTagColor} border border-blue-200 text-blue-500 text-xs px-2 py-1 rounded-full shadow-sm`}
            >
              {tag}⋆｡
            </span>
          ))}
        </div>
        <div className="mt-2 text-md mb-3">
        {isUnlocked ? (
          <span className="text-green-600 font-semibold quicksand">🔓 Unlocked</span>
        ) : (
          <span className="text-blue-800 font-semibold quicksand italic ">⏳ Unlocks in: {timeLeft}</span>
        )}
      </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onManage}
            className="bg-blue-500 font-extrabold hover:bg-blue-600 text-blue-900 px-4 py-1 rounded-xl shadow-md transition"
          >
            Manage 
          </button>
          <button
            onClick={onDetails}
            className="bg-purple-500 font-extrabold hover:bg-blue-600 text-blue-900 px-4 py-1 rounded-xl shadow-md transition"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapsuleCard;
