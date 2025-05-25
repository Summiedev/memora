import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MyImage from '../assets/rightt.png'; // decorative image

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password ) {
      setError('All fields are required!');
      return;
    }

    setSuccess('');
    setRegisterError('');


    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);

      // Clear previous messages
      setError('');
      setRegisterError('');
      setSuccess('Signup successful! Redirecting...');

      // Store token or session data
      localStorage.setItem('token', response.data.token);

      // Redirect user after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      // Handle error from backend
      const serverError = err.response?.data?.error || 'User already registered. Please try again.';
      setRegisterError(serverError);
    }

    // try {
    //   const response = await axios.post('http://localhost:5000/api/auth/register', formData);
    //   if (response.status === 201) {
    //     setSuccess('Registration successful! Redirecting...');

    //   localStorage.setItem('token', response.data.token);
    //     setTimeout(() => navigate('/dashboard'), 2000);

    //   }
    // } catch (err) {
    //   setError(err.response?.data?.message || 'Something went wrong');
    // }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-memora-clouds text-white">
      {/* Cloud elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      {/* Signup Form Container */}
      <div className="relative chewy bg-white text-black shadow-2xl z-10 w-full max-w-[550px] text-base leading-relaxed rounded-3xl border border-blue-200 overflow-hidden">

        <form onSubmit={handleSignup}
        className="mx-auto p-8 bg-white text-black text-base space-y-6 font-normal"
        >
          {registerError && (
            <div className="mb-4 bg-red-100 border border-red-300 text-red-600 px-4 py-2 rounded relative text-sm">
              {registerError}
              <button
                type="button"
                onClick={() => setRegisterError("")}
                className="absolute top-0 right-0 px-3 py-1 text-xl leading-none focus:outline-none"
              >
                &times;
              </button>
            </div>
          )}
          <h2 className="text-3xl font-bold text-center text-sky-500 mb-3">
            ♡ Sign in to Memora ♡
          </h2>
          <p className="text-center text-gray-600 mb-5 leading-loose">
            Welcome back~!₊˚⊹₊𓂃 Please sign in to continue ₊˚୨୧⋆｡˚
          </p>
          <div className="flex justify-center gap-10 mb-4">
  {/* Google */}
  <button
    type="button"
    className="w-[220px] h-[52px] flex items-center justify-center bg-[#D4E4FF] hover:bg-[#bdd7ff] text-blue-800 text-base font-semibold rounded-[18px] shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
  >
    <a
      href="http://localhost:5000/api/auth/google"
      className="w-[220px] h-[52px] flex items-center justify-center"
    >
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-10 h-7" fill="#5B75FF">
          <path d="M44.5 20H24v8.5h11.8C34.5 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l6.4-6.4C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.6 0 20.2-7.7 21-21 .1-.7.1-1.3.1-2z" />
        </svg>
        <span className="font-cursive text-2xl">Google</span>
      </div>
    </a>
  </button>

  {/* Instagram */}
  <button
    type="button"
    className="w-[220px] h-[52px] flex items-center justify-center bg-[#EBD7FF] hover:bg-[#dcc4f9] text-purple-800 text-base font-semibold rounded-[18px] shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
  >
    <div className="flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-9 h-7" fill="#A580E0">
        <path d="M224 202.66A53.34 53.34 0 1 0 277.34 256 53.38 53.38 0 0 0 224 202.66Zm124.71-41a54 54 0 0 0-30.54-30.54C291.26 124.28 224 124 224 124s-67.26.28-94.17 6.14a54 54 0 0 0-30.54 30.54C93.28 152.74 93 224 93 224s.28 67.26 6.14 94.17a54 54 0 0 0 30.54 30.54C156.74 353.72 224 354 224 354s67.26-.28 94.17-6.14a54 54 0 0 0 30.54-30.54c5.86-26.91 6.14-94.17 6.14-94.17s-.28-67.26-6.14-94.17ZM224 338a82 82 0 1 1 82-82 82 82 0 0 1-82 82Zm85.33-148a19.2 19.2 0 1 1 19.2-19.2 19.2 19.2 0 0 1-19.2 19.2Z" />
      </svg>
      <span className="font-cursive text-2xl">Instagram</span>
    </div>
  </button>
</div>

          <div className="flex items-center justify-center my-4 text-sm text-black">
            <div className="flex-grow h-px bg-gray-600"></div>
            <span className="mx-4">or</span>
            <div className="flex-grow h-px bg-gray-600"></div>
          </div>

          <div className="mb-5">
            <input
              type="text"
              id="fullname"
              placeholder="Fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          
          {success && <div className="mb-3 text-green-300 text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-xl text-lg transition duration-300 ease-in-out"
          >
            ♡ Continue →
          </button>
          <p className="text-center text-sm text-sky-500 mt-1">

            Already have an account?{" "}
            <a href="/login" className="underline hover:text-sky-700">
              Login
            </a>
          </p>
        </form>
      </div>


    </div>
  );
};

export default SignupPage;
