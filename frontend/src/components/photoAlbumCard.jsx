import React from "react";
import api from '../utils/auth';
import { Eye, Trash2, Share2, Pencil } from "lucide-react";

export default function PhotoAlbumCard({ album, onView, onDelete, onShare = () => {} }) {
  const { _id, title, photos, createdAt } = album;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this photo album? This can't be undone.")) return;
    try {
      await api.delete(`/photo-memories/${_id}`);
      onDelete(_id);
    } catch (err) {
      console.error("Failed to delete album:", err);
      alert("Could not delete album.");
    }
  };

  return (
    <div
      onClick={onView}
      className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200 relative cursor-pointer active:scale-[0.99]"
    >
      {/* Action icons top right */}
      <div className="absolute top-3 right-3 flex gap-1.5 z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
          title="View / Edit"
        >
          <Eye size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(album); }}
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
          title="Share"
        >
          <Share2 size={13} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <h3 className="quicksand text-base font-bold text-blue-800 mb-1 pr-20 overflow-hidden text-ellipsis whitespace-normal break-words">
        📸 {title}
      </h3>
      <p className="text-blue-400 text-xs mb-3 italic">
        {new Date(createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
      </p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {photos.slice(0, 3).map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Photo ${idx + 1}`}
            className="w-full h-20 object-cover rounded-xl border border-blue-100 shadow-sm"
          />
        ))}
        {photos.length === 0 && (
          <div className="col-span-3 h-20 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="text-2xl opacity-40">🖼️</span>
          </div>
        )}
      </div>

      {photos.length > 3 && (
        <p className="text-xs text-gray-400 mt-2">+{photos.length - 3} more photos ✧</p>
      )}

      {/* Tap hint */}
      <div className="mt-3 flex items-center gap-1 text-[10px] text-blue-300 font-semibold">
        <Pencil size={9} /> Tap to view &amp; edit
      </div>
    </div>
  );
}
