import React from "react";
import { FiEdit2, FiTrash2, FiShare2 } from "react-icons/fi";

export default function DiaryCard({ entry ,onView,
  onDelete,
  onShare = () => {},}) {
  const { title, entryText,createdAt } = entry;
 const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;
    try {
      // call your delete endpoint
      await axios.delete(
        `http://localhost:5000/api/diary-entries/${_id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // notify parent
      onDelete(_id);
    } catch (err) {
      console.error("Failed to delete album:", err);
      alert("Could not delete album.");
    }
  };

  const handleEdit = () => {
    // pass the entire album up so parent can open an edit form
    onEdit(album);
  };
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 relative">
      {/* Icons */}
      <div className="absolute top-3 right-3 flex gap-3 text-blue-400">
         <button
            type="button"
            className="hover:text-blue-600 transition"
            onClick={onView} title="View"
          >
            <FiEdit2 size={16} />
          </button>
        
          <button
            type="button"
            onClick={handleDelete}
            className="hover:text-red-400 transition"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        
          <button
            type="button"
            onClick={() => onShare(album)}
            className="hover:text-blue-600 transition"
            title="Share"
          >
            <FiShare2 size={16} />
          </button>
      </div>

      <h3 className="quicksand text-xl font-bold text-blue-700 mb-4 overflow-hidden text-ellipsis whitespace-normal break-words">
        ✧･ﾟ {title}
      </h3>
      <p className="text-blue-500 text-xs italic mb-4">
      {new Date(createdAt).toLocaleDateString()}
      </p>
      <p className="reenie-beanie text-[1.15rem] leading-relaxed text-gray-700 line-clamp-5 overflow-hidden text-ellipsis whitespace-normal break-words">
        {entryText}
      </p>
    </div>
  );
}
