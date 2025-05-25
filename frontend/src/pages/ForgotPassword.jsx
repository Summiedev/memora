import React, { useState } from 'react';
import axios from 'axios';
import MyImage from '../assets/rightt.png'; // Keep your image as is

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/requestPasswordReset", { email: formData.email });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-memora-clouds text-white">
      {/* Cloud elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      
      {/* Forgot Password Container */}
      <div className="relative chewy bg-white text-black rounded-3xl px-10 py-14 shadow-2xl z-10 w-full max-w-[550px] text-sm border border-blue-100">
        <form onSubmit={handleForgotPasswordSubmit} className="text-black text-sm font-normal">
          <h2 className="text-2xl font-bold text-center text-blue-500 mb-2">Forgot Password?</h2>
          <p className="text-center text-gray-600 mb-6 leading-relaxed">
            Don’t worry~ we’ll help you reset it ₊˚⊹₊˚
          </p>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-xs text-blue-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-black placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-xl transition duration-300 ease-in-out flex items-center justify-center gap-2"
          >
            Send Reset Link <span>→</span>
          </button>

          {/* Back to login link */}
          <p className="text-center text-sm text-blue-500 mt-4 border-t border-gray-100">
            Remember your password?{" "}
            <a href="/login" className="underline hover:text-blue-700">
              Login here
            </a>
          </p>
        </form>

        {/* Message display */}
        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
