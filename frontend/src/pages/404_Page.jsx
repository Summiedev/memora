import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center text-center p-4">
      {/* Floating Time Capsule */}
      <div className="relative mb-8">
        <div className="w-40 h-40 bg-purple-300 rounded-full shadow-xl animate-bounce-slow">
          <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
            🕳️
          </div>
        </div>
        <p className="text-sm mt-2 text-gray-600 italic">Oops... where’d we land?</p>
      </div>

      {/* Main Message */}
      <h1 className="text-6xl font-extrabold text-indigo-700 mb-4 animate-wiggle">404</h1>
      <p className="text-2xl text-gray-700 font-medium mb-2">This time capsule went missing!</p>
      <p className="text-gray-500 mb-6">Or maybe it traveled to another timeline... 👀</p>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300"
      >
        Go Back to Safety
      </button>
    </div>
  );
};

export default NotFound;
