"use client";

import { useState } from "react";
import { BarChart2, Shield, Flame, Settings, Bookmark } from "lucide-react";

export default function Sidebar() {
  const [active, setActive] = useState("Saved Businesses");

  const navItems = [
    { name: "Overview", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "Saved Businesses", icon: <Bookmark className="w-5 h-5" />, badge: 2 },
    { name: "My Interests", icon: <Shield className="w-5 h-5" /> },
    { name: "Meetings/Messages", icon: <Flame className="w-5 h-5" /> },
  ];

  return (
    <aside className="flex flex-col justify-between h-screen w-60 bg-white border-r">
      {/* Top Navigation Links */}
      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-blue-50 text-[#326295]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`${
                    isActive ? "text-[#326295]" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings Link */}
      <div className="mb-6 px-4">
        <button
          onClick={() => setActive("Settings")}
          className={`flex items-center space-x-3 text-gray-600 hover:text-gray-800 text-sm font-medium`}
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
