// Navbar_main.jsx — tab-safe, no spurious logouts
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, Settings, LogOut, X, Home, Archive,
  Users, BookOpen, ChevronDown, Menu,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import TimeCapsuleModal from "./CreateCapsuleForm";
import ProfileSettingsPage from "../pages/Profile_Settings";
import api from "../utils/auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/capsules",  label: "Capsules",  icon: Archive },
  { href: "/friends",   label: "Friends",   icon: Users },
  { href: "/memories",  label: "Memories",  icon: BookOpen },
];

const Navbar_Main = () => {
  const [showNotif,        setShowNotif]        = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [user,             setUser]             = useState(null);
  const [loadingUser,      setLoadingUser]      = useState(true);
  const [notifications,    setNotifications]    = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);

  const notifRef   = useRef();
  const profileRef = useRef();

  // ── Fetch user — SAFE: never removes token on network errors ──────────────
  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.user || res.data.data);
    } catch (err) {
      if (err.response?.status === 401) setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // ── Re-fetch user when tab becomes visible again ──────────────────────────
  // This is what makes switching tabs feel smooth — we silently refresh
  // without ever clearing auth state
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchUser();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchUser]);

  // ── Fetch notifications ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    api.get("/friends/pending")
      .then((res) => {
        const received = res.data.received || [];
        const notifs = received.map((r) => ({
          id:      r._id,
          message: `${r.username} sent you a friend request`,
          time:    "Recently",
          type:    "friend_request",
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      })
      .catch(() => {}); // Silent — don't touch auth
  }, [user]);

  // ── Logout (explicit user action only) ───────────────────────────────────
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // best effort: even if logout fails, drop local UI session state
    }
    setUser(null);
    window.location.href = "/login";
  };

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
                {/* eslint-disable-next-line no-unused-vars */}
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = currentPath === href;
                  return (
                    <a key={href} href={href}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 quicksand ${
                        isActive
                          ? "bg-violet-100 text-violet-700"
                          : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                      }`}>
                      <Icon size={15} />{label}
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
                    onClick={() => { setShowNotif((v) => !v); if (!showNotif) setUnreadCount(0); }}
                    className="relative p-2.5 rounded-xl text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-all">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                        exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-50">
                          <span className="text-sm font-bold text-gray-700 quicksand">Notifications</span>
                          {notifications.length > 0 && (
                            <span className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider">{notifications.length} new</span>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                              <span className="text-3xl mb-2">🔔</span>
                              <p className="text-sm text-gray-400 quicksand">All caught up!</p>
                            </div>
                          ) : notifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Users size={12} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 quicksand">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-4 py-2.5 border-t border-violet-50">
                            <a href="/friends" className="text-xs font-semibold text-violet-600 hover:underline quicksand">View all in Friends →</a>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setShowProfile((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white shadow">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 quicksand hidden lg:block">{user?.username}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                        exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-violet-50">
                          <p className="text-sm font-bold text-gray-800 quicksand">{user?.username}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <button onClick={() => { setShowSettingsPage(true); setShowProfile(false); }}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors quicksand">
                            <Settings size={14} /> Settings
                          </button>
                          <button onClick={handleLogout}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-xl transition-colors quicksand">
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile right icons (notification + profile avatar) */}
            {user && !loadingUser && (
              <div className="flex md:hidden items-center gap-2">
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setShowNotif((v) => !v); if (!showNotif) setUnreadCount(0); }}
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-violet-50 transition-all">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white animate-pulse" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                        exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                        className="absolute right-0 mt-2 w-72 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-violet-50">
                          <span className="text-sm font-bold text-gray-700 quicksand">Notifications</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                              <span className="text-2xl mb-2">🔔</span>
                              <p className="text-sm text-gray-400 quicksand">All caught up!</p>
                            </div>
                          ) : notifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-violet-50 border-b border-gray-50 last:border-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center shrink-0">
                                <Users size={11} className="text-white" />
                              </div>
                              <p className="text-xs text-gray-700 quicksand">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Profile avatar */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setShowProfile((v) => !v)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-xs font-bold text-white shadow">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </button>
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                        exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-violet-100 rounded-2xl shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-violet-50">
                          <p className="text-sm font-bold text-gray-800 quicksand">{user?.username}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <button onClick={() => { setShowSettingsPage(true); setShowProfile(false); }}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-violet-50 rounded-xl quicksand">
                            <Settings size={14} /> Settings
                          </button>
                          <button onClick={handleLogout}
                            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-xl quicksand">
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu — removed, using bottom nav instead */}
      </nav>

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
