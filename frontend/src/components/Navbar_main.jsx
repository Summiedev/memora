// Navbar_main.jsx — fixed + redesigned
import React, { useState, useEffect, useRef } from "react";
import {
  Bell, User, Settings, LogOut, X, Home, Archive,
  Users, BookOpen, ChevronDown, Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimeCapsuleModal from "./CreateCapsuleForm";
import ProfileSettingsPage from "../pages/Profile_Settings";
import axios from "axios";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/capsules",  label: "Capsules",  icon: Archive },
  { href: "/friends",   label: "Friends",   icon: Users },
  { href: "/memories",  label: "Memories",  icon: BookOpen },
];

const Navbar_Main = () => {
  const [showNotif,       setShowNotif]       = useState(false);
  const [showProfile,     setShowProfile]     = useState(false);
  const [showForm,        setShowForm]        = useState(false);
  const [showSettingsPage,setShowSettingsPage]= useState(false);
  const [showMobileMenu,  setShowMobileMenu]  = useState(false);
  const [user,            setUser]            = useState(null);
  const [loadingUser,     setLoadingUser]     = useState(true);
  const [notifications,   setNotifications]   = useState([]);
  const [unreadCount,     setUnreadCount]     = useState(0);

  const notifRef   = useRef();
  const profileRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken  = urlParams.get("token");
        if (urlToken) {
          localStorage.setItem("token", urlToken);
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

  // Fetch real notifications from pending friend requests
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/friends/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const received = res.data.received || [];
        const notifs = received.map((r) => ({
          id:      r._id,
          message: `${r.username} sent you a friend request`,
          time:    "Recently",
          type:    "friend_request",
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      } catch (_) {}
    };
    fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post(
        "http://localhost:5000/api/auth/logout", {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (_) {}
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const handleMarkAllRead = () => setUnreadCount(0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPath = window.location.pathname;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href="/dashboard" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="chewy text-2xl bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent tracking-wide">
                Memora
              </span>
            </a>

            {/* Desktop Nav Links */}
            {user && !loadingUser && (
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = currentPath === href;
                  return (
                    <a
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 quicksand ${
                        isActive
                          ? "bg-violet-100 text-violet-700"
                          : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Right icons */}
            {user && !loadingUser && (
              <div className="hidden md:flex items-center gap-2">

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setShowNotif((v) => !v);
                      if (!showNotif) handleMarkAllRead();
                    }}
                    className="relative p-2.5 rounded-xl text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-all"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-50">
                          <span className="text-sm font-bold text-gray-700 quicksand">Notifications</span>
                          {notifications.length > 0 && (
                            <span className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider">
                              {notifications.length} new
                            </span>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                              <span className="text-3xl mb-2">🔔</span>
                              <p className="text-sm text-gray-400 quicksand">All caught up!</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <Users size={12} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 quicksand">{n.message}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-4 py-2.5 border-t border-violet-50">
                            <a href="/friends" className="text-xs font-semibold text-violet-600 hover:underline quicksand">
                              View all in Friends →
                            </a>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfile((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white shadow">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 quicksand hidden lg:block">
                      {user?.username}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-violet-50">
                          <p className="text-sm font-bold text-gray-800 quicksand">{user?.username}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => { setShowSettingsPage(true); setShowProfile(false); }}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors quicksand"
                          >
                            <Settings size={14} /> Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-xl transition-colors quicksand"
                          >
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            {user && !loadingUser && (
              <button
                onClick={() => setShowMobileMenu((v) => !v)}
                className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-violet-50 transition-all"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && user && !loadingUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              className="md:hidden border-t border-violet-100 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold quicksand transition-all ${
                      currentPath === href ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-violet-50"
                    }`}
                  >
                    <Icon size={16} /> {label}
                  </a>
                ))}
                <div className="border-t border-violet-50 pt-2 mt-2 space-y-1">
                  <button
                    onClick={() => { setShowSettingsPage(true); setShowMobileMenu(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 hover:bg-violet-50 rounded-xl quicksand"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-xl quicksand"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Capsule Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "-20%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{   y: "-20%", opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
              <TimeCapsuleModal isOpen={showForm} closeModal={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      {showSettingsPage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full h-[85%] max-w-7xl bg-white rounded-3xl shadow-2xl overflow-y-auto relative">
            <ProfileSettingsPage onClose={() => setShowSettingsPage(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar_Main;
