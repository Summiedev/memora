import React from "react";

export default function ProfileDropdown({ onLogout, onSettings }) {
  return (
    <div className="absolute top-16 right-4 bg-white w-48 rounded-lg shadow-md z-50">
      <ul className="text-gray-700 text-sm">
        <li className="p-3 hover:bg-gray-100 cursor-pointer" onClick={onSettings}>⚙️ Settings</li>
        <li className="p-3 hover:bg-gray-100 cursor-pointer" onClick={onLogout}>🚪 Logout</li>
      </ul>
    </div>
  );
}