// src/pages/ResetConfirmation.jsx
import React from "react";
import { Link } from "react-router-dom";

const ResetConfirmation = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-memora-clouds text-white">
      {/* Cloud elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>

      <div className="chewy relative bg-white text-black rounded-3xl px-10 py-14 shadow-2xl z-10 w-full max-w-[500px] text-sm border border-blue-100 text-center">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Reset Link Sent!</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          If an account exists for that email, a reset link has been sent ₊˚⊹₊˚
        </p>
         <p className="text-gray-600 mb-4 leading-relaxed">
         Check your email for further confirmation ₊˚⊹₊˚
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-400 hover:bg-blue-500 text-white py-2 px-6 rounded-xl transition duration-300 ease-in-out"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetConfirmation;
