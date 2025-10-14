
import React, { useState } from 'react';
import axios from 'axios';
import MyImage from '../assets/rightt.png'; // Keep your image as is
import { Eye, EyeOff } from 'lucide-react';
import MemoraLoaderOverlay from '../components/MemoraLoader';
const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username || !formData.password) {
      setError('All fields are required!');
      return;
    }

    try {
       setLoading(true);
      // Send login request to backend
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);

      // Clear previous messages
      setError('');
      setLoginError('');
      setSuccess('Login successful! Redirecting...');

      // Store token or session data
      localStorage.setItem('token', response.data.token);

      // Redirect user after successful login
      setTimeout(() => {
         setLoading(false);
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      // Handle error from backend
        setLoading(false);
      const serverError = err.response?.data?.error || 'Invalid username or password. Please try again.';
      setLoginError(serverError);
    }
  };

  return (
        <> 
        {loading && <MemoraLoaderOverlay/>}
    <div className="relative min-h-screen flex items-center justify-center bg-memora-clouds text-white">
      {/* Cloud elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>

      {/* Login Container */}
      <div className="relative chewy bg-white text-black shadow-2xl z-10 w-full max-w-[550px] text-base leading-relaxed rounded-3xl border border-blue-200 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="mx-auto p-8 bg-white text-black text-base space-y-6 font-normal"
        >
          {/* Error */}
          {loginError && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-600 px-4 py-2 rounded relative text-sm">
              {loginError} (｡•́︿•̀｡)
              <button
                type="button"
                onClick={() => setLoginError("")}
                className="absolute top-1 right-2 text-xl font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Heading */}
          <h2 className="text-3xl font-bold text-center text-sky-500 mb-3">
            ♡ Sign in to Memora ♡
          </h2>
          <p className="text-center text-gray-600 mb-5 leading-loose">
            Welcome back~!₊˚⊹₊𓂃 Please sign in to continue ₊˚୨୧⋆｡˚
          </p>

          {/* Social Buttons */}
          <div className="flex justify-center gap-10 mb-4">
            {/* Google */}
            <button
              type="button"
              className="w-[220px] h-[52px] flex items-center justify-center bg-[#C6B7F5] hover:bg-[#B19BEF] text-white text-base font-semibold rounded-[18px] shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
            >
              <a
                href="http://localhost:5000/api/auth/google"
                className="w-[220px] h-[52px] flex items-center justify-center"
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-10 h-7" fill="white">
                    <path d="M44.5 20H24v8.5h11.8C34.5 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l6.4-6.4C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.6 0 20.2-7.7 21-21 .1-.7.1-1.3.1-2z" />
                  </svg>
                  <span className="font-cursive text-2xl">Google</span>
                </div>
              </a>
            </button>

            {/* Instagram */}
            <button
              type="button"
              className="w-[220px] h-[52px] flex items-center justify-center bg-[#833AB4] hover:bg-[#6f2c91] text-white text-base font-semibold rounded-[18px] shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-9 h-7" fill="white">
                  <path d="M224 202.66A53.34 53.34 0 1 0 277.34 256 53.38 53.38 0 0 0 224 202.66Zm124.71-41a54 54 0 0 0-30.54-30.54C291.26 124.28 224 124 224 124s-67.26.28-94.17 6.14a54 54 0 0 0-30.54 30.54C93.28 152.74 93 224 93 224s.28 67.26 6.14 94.17a54 54 0 0 0 30.54 30.54C156.74 353.72 224 354 224 354s67.26-.28 94.17-6.14a54 54 0 0 0 30.54-30.54c5.86-26.91 6.14-94.17 6.14-94.17s-.28-67.26-6.14-94.17ZM224 338a82 82 0 1 1 82-82 82 82 0 0 1-82 82Zm85.33-148a19.2 19.2 0 1 1 19.2-19.2 19.2 19.2 0 0 1-19.2 19.2Z" />
                </svg>
                <span className="font-cursive text-2xl">Instagram</span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center text-gray-500 mb-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="px-2 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="username" className="block text-sm mb-1 text-sky-600">
              Email address or username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="kay102"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-sky-600">
              Password
            </label>
             <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        className="absolute inset-y-0 right-3 flex items-center p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-xl text-lg transition duration-300 ease-in-out"
          >
            ♡ Continue →
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-sky-500 mt-2">
            Don’t have an account?{" "}
            <a href="/register" className="underline hover:text-sky-700">
              Sign up here!
            </a>
          </p>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-4 border-t border-gray-200 pt-4">
            Forgot your password?{" "}
            <a href="/forgot-password" className="font-semibold text-sky-400 hover:underline">
              Click here to reset ( •̀ᴗ•́ )و ̑̑
            </a>
          </div>
        </form>
      </div>
    </div>
</>


  );
};

export default LoginPage;
