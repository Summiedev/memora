// components/EmptyState.jsx
import React from "react";

export default function EmptyState({ message }) {
  return (
    <div className="text-center text-gray-400 p-6 italic">
      {message || "Nothing to show just yet. Add your first memory!"}
    </div>
  );
}
