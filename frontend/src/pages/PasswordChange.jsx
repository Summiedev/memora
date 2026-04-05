import React, { useState } from "react";
import api from "../utils/auth";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/auth/resetPassword/${id}/${token}`, {
        password,
      });
      setMessage(res.data.message);
      window.location.href = "/login"; 

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-memora-clouds text-white font-cursive">
      {/* Cloud elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>

      {/* Reset Password Container */}
      <div className="relative chewy bg-white text-black rounded-3xl px-10 py-14 shadow-2xl z-10 w-full max-w-[550px] text-sm border border-blue-100">
        <form onSubmit={handleSubmit} className="text-black text-sm font-normal">
          <h2 className="text-2xl font-bold text-center text-blue-500 mb-2">Reset Password ~˚</h2>
          <p className="text-center text-gray-600 mb-6 leading-relaxed">
            Set a brand new password to protect your memories ₊˚⊹₊˚
          </p>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-xs text-blue-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-black placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-xl transition duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            Reset Password <span>✨</span>
          </button>

          {/* Back to login link */}
          <p className="text-center text-sm text-blue-500 mt-4 border-t border-gray-100 pt-2">
            Remember your password? {" "}
            <a href="/login" className="underline hover:text-blue-700">
              Login here
            </a>
          </p>

          {/* Feedback Message */}
          {message && (
            <p className="mt-4 text-sm text-green-600 text-center">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
