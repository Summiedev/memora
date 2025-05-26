// Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimeCapsuleModal from "./CreateCapsuleForm";
import ProfileSettingsPage from "../pages/Profile_Settings";
import axios from "axios";

const Navbar_Main = () => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null); // ✅ Store user info
  const [loadingUser, setLoadingUser] = useState(true); // ✅ Loading state

  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef();
  const profileRef = useRef();

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
  
        if (urlToken) {
          localStorage.setItem("token", urlToken);
          // Clean up the URL (remove the ?token=...)
          window.history.replaceState({}, document.title, window.location.pathname);
        }
  
        const token = localStorage.getItem("token");
        if (!token) return setLoadingUser(false);

        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/login"; // Redirect or update as needed
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-[#a5b4fc] to-[#c7d2fe] border-b chewy border-[#dbe7f5] shadow-md relative z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
           {/* Logo */}
      <div className="text-2xl font-bold text-[#6C89FF] tracking-wide font-cursive">
        Memora
      </div>

      {/* Nav Links */}
      {user && !loadingUser && (
        <div className="hidden sm:flex items-center space-x-6">
          <a href="/dashboard" className="text-[#4e4e6a] text-2xl  hover:text-[#87aaff] transition-all">
            Dashboard
          </a>
          <a href="/capsules" className="text-[#4e4e6a] text-2xl hover:text-[#87aaff] transition-all">
            Capsules
          </a>
         
           <a href="/friends" className="text-[#4e4e6a] text-2xl hover:text-[#87aaff] transition-all">
            Friends
          </a>
          <a href="/memories" className="text-[#4e4e6a] text-2xl hover:text-[#87aaff] transition-all">
            Memories
          </a>
        </div>
      )}

      {/* Icons */}
      {user && !loadingUser && (
        <div className="hidden sm:flex items-center space-x-5 relative">

          {/* Notifications */}
          <div
            className="relative"
            onMouseEnter={() => setShowNotif(true)}
            onMouseLeave={() => setShowNotif(false)}
            ref={notifRef}
          >
            <button className="relative">
              <Bell className="w-5 h-5 text-[#6e7aa0] hover:text-[#87aaff]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-400" />
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#dbe7f5] rounded-xl shadow-lg p-4"
                >
                  <div className="text-sm text-[#6e7aa0] font-semibold mb-2">Notifications</div>
                  <div className="border border-[#e6edf8] p-2 rounded-lg hover:bg-[#f5f9ff] cursor-pointer">
                    <p className="text-sm text-[#4e4e6a]">Your capsule has been saved!</p>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

                   {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile((prev) => !prev)}>
              <User className="w-6 h-6 text-[#6e7aa0] hover:text-[#87aaff]" />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-[#dbe7f5] rounded-xl shadow-lg p-3"
                >
                  <div className="px-4 py-2 text-sm font-medium text-[#6e7aa0]">
                    {user?.username || "User"}
                  </div>
                  <button
                    onClick={() => setShowSettingsPage(true)}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#4e4e6a] hover:bg-[#f0f6ff] rounded-md"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-[#fef2f2] rounded-md"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

           {/* Mobile Menu Toggle */}
 <div className="md:hidden">
  <button
    onClick={() => setShowMobileMenu(!showMobileMenu)}
    className="p-2 text-[#6e7aa0] hover:bg-[#e3ecfa] dark:hover:bg-[#374151] rounded-md"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</div>
    </div>
     {/* Mobile Menu */}
 <AnimatePresence>
  {showMobileMenu && user && !loadingUser && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="md:hidden flex flex-col space-y-3 mt-4 pb-4 border-t border-[#e6edf8] dark:border-[#374151]"
    >
      {["dashboard", "capsules", "friends", "memories"].map((page) => (
        <a
          key={page}
          href={`/${page}`}
          className="text-lg font-medium text-[#4e4e6a] dark:text-white hover:text-[#6C89FF] transition-colors duration-200"
        >
          {page.charAt(0).toUpperCase() + page.slice(1)}
        </a>
      ))}
      <button
        onClick={() => {
          setShowSettingsPage(true);
          setShowMobileMenu(false);
        }}
        className="flex items-center gap-2 text-sm text-[#4e4e6a] dark:text-white"
      >
        <Settings className="w-4 h-4" /> Settings
      </button>
      <button
        onClick={() => {
          handleLogout();
          setShowMobileMenu(false);
        }}
        className="flex items-center gap-2 text-sm text-red-500"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </motion.div>
  )}
</AnimatePresence>

  </div>
</nav>

      {/* Capsule Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "-30%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-30%", opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-4/5 max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              >
                <X />
              </button>
              <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false) } />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       {showSettingsPage && (
      <div className="fixed inset-0 z-50 backdrop-blur-md bg-opacity-40 flex items-center justify-center">
        <div className="w-full h-[80%] max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-y-auto relative">
          <ProfileSettingsPage onClose={() => setShowSettingsPage(false)} />
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar_Main;
