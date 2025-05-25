import React from "react";
import { FiEdit2, FiTrash2, FiShare2 } from "react-icons/fi";
import axios from "axios";
import { useState } from "react";

export default function PhotoAlbumCard({ album,onView,
  onDelete,
  onShare = () => {}, }) {
  const { _id, title, photos, createdAt } = album;
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;
    try {
      // call your delete endpoint
      await axios.delete(
        `http://localhost:5000/api/photo-memories/${_id}`,
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
    <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-blue-200 transition duration-200 relative">
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

      <h3 className="quicksand text-lg font-bold text-blue-800 mb-1 overflow-hidden text-ellipsis whitespace-normal break-words">
        📸 {title}
      </h3>
      <p className="text-blue-400 text-xs mb-2 italic">
        {new Date(createdAt).toLocaleDateString()}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 3).map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Photo ${idx + 1}`}
            className="w-full h-24 object-cover rounded-lg border border-blue-100 shadow-sm overflow-hidden text-ellipsis whitespace-normal break-words"
          />
        ))}
      </div>

      {photos.length > 3 && (
        <p className="text-xs text-gray-400 mt-1">+{photos.length - 3} more ✧</p>
      )}
    </div>
  );
}
