import React, { useEffect, useState } from "react";
import { Share2, Trash, Pencil, Eye, Settings } from "lucide-react";

const tagColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];

const cardGradients = [
  "from-blue-400 to-indigo-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-teal-400 to-cyan-500",
  "from-rose-400 to-pink-500",
];

const useCountdown = (targetDate) => {
  const [display, setDisplay] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!targetDate) { setUnlocked(true); return; }
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setUnlocked(true); setDisplay(""); return; }
      setUnlocked(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0)        setDisplay(`${d}d ${h}h ${m}m`);
      else if (h > 0)   setDisplay(`${h}h ${m}m ${s}s`);
      else              setDisplay(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { display, unlocked };
};

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
  tags = [],
  onEdit,
  capsuleId,
}) => {
  const { display: timeLeft, unlocked: isUnlocked } = useCountdown(unlockTime);

  const [gradientClass] = useState(
    () => cardGradients[Math.floor(Math.random() * cardGradients.length)]
  );

  const handleManage = (e) => {
    e.stopPropagation();
    if (onManage) onManage();
    else if (onDetails) onDetails(); // fallback to details if manage not set
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    if (onDetails) onDetails();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) onShare();
    else {
      // fallback: copy link
      navigator.clipboard.writeText(window.location.origin + `/capsules`).catch(() => {});
      alert("Link copied!");
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this capsule? This can't be undone.")) {
      onDelete?.();
    }
  };

  return (
    <div className="group relative w-full max-w-[300px] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-blue-100 font-quicksand">

      {/* Cover image / gradient header */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {image && (
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${!isUnlocked ? "blur-sm brightness-75" : ""}`}
          />
        )}

        {/* Lock overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl drop-shadow">🔒</span>
            <span className="text-white text-xs font-bold drop-shadow-md bg-black/30 px-2 py-0.5 rounded-full">
              {timeLeft}
            </span>
          </div>
        )}

        {/* Unlocked glow */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        {/* Shared badge */}
        {sharedBy && (
          <div className="absolute top-2 left-2 bg-pink-500/90 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow">
            From {sharedBy}
          </div>
        )}

        {/* Action buttons — always visible on mobile, hover on desktop */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors active:scale-95"
            title="Edit"
          >
            <Pencil size={12} className="text-blue-700" />
          </button>
          <button
            onClick={handleShare}
            className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors active:scale-95"
            title="Share"
          >
            <Share2 size={12} className="text-blue-700" />
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 bg-white/90 hover:bg-red-100 rounded-full flex items-center justify-center shadow transition-colors active:scale-95"
            title="Delete"
          >
            <Trash size={12} className="text-rose-500" />
          </button>
        </div>

        {/* Status pill on image */}
        <div className="absolute bottom-2 left-2">
          {isUnlocked ? (
            <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
              🔓 Unlocked
            </span>
          ) : (
            <span className="bg-rose-500/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
              🔒 Sealed
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold text-blue-900 truncate mb-2">
          {title ? title.charAt(0).toUpperCase() + title.slice(1) : "Untitled"}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagColors[idx % tagColors.length]}`}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Countdown (only when locked) */}
        {!isUnlocked && timeLeft && (
          <p className="text-xs text-rose-500 font-semibold mb-3 flex items-center gap-1">
            ⏳ <span>Opens in {timeLeft}</span>
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleManage}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 transition-colors flex items-center justify-center gap-1"
          >
            <Settings size={11} /> Manage
          </button>
          <button
            onClick={handleDetails}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-800 transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={11} /> Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapsuleCard;
