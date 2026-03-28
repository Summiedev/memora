"use client";

import Image from "next/image";
import { Bell, Settings } from "lucide-react";

export default function TopNavigation() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
     
      <div className="flex items-center space-x-2">
        <Image
          src="/logo.png" 
          alt="AfriStakes Logo"
          width={28}
          height={28}
        />
        <span className="text-lg font-semibold text-[#326295]">AfriStakes</span>
      </div>

      
      <div className="flex items-center space-x-4">
       
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>

        
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-700" />
        </button>

       
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full cursor-pointer">
          <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white font-semibold rounded-full">
            P
          </div>
          <span className="text-sm font-medium text-gray-700">Investor</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
