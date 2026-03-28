import React, { useState, useEffect } from "react";
import { Bell, Sparkles } from "lucide-react";
import Navbar_Main from "../components/Navbar_main";
import { motion } from "framer-motion";
import FloatingActions from "../components/FloatingBtn";
import { useLocation } from "react-router-dom";
import DashboardMiniCarousel from "../components/DashboardCaraousel";
import RecentMemories from "../components/RecentMemories";
import MemoryCalendar from "../components/MemoryCalendar";
import MonthlyRecap from "../components/MonthlyRecap";
import MoodTracker from '../components/MoodTracker';
import axios from "axios";

const prompts = [
  "What made you smile today? ☀️",
  "Who are you grateful for right now? 💛",
  "What's one small win you're proud of? 🌟",
  "Describe a perfect moment from this week 🌸",
  "What's something you want to remember forever? 💌",
];

const notifications = [
  { icon: "🎁", text: '"Birthday Wish" was opened by 3 friends', time: "2h ago" },
  { icon: "⏰", text: '"Memory Lane" unlocks in 1 week', time: "1d ago" },
];

const tips = [
  "Add voice notes to your capsules for a personal touch! 🎙️",
  "Use tags to group capsules by mood, year, or people 🏷️",
  "Share a capsule with friends for a surprise ✨",
];

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tipIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const [promptIdx] = useState(() => Math.floor(Math.random() * prompts.length));
  const { search, pathname } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      params.delete("token");
      const newSearch = params.toString();
      window.history.replaceState({}, document.title, pathname + (newSearch ? `?${newSearch}` : ""));
    }
  }, [search, pathname]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setUser(r.data.data || r.data.user)).catch(() => {});
  }, []);

  const firstName = user?.fullname?.split(' ')[0] || user?.username || 'friend';

  return (
    <div style={{ background: "linear-gradient(160deg,#fce4f3 0%,#ede9ff 40%,#dbeafe 100%)", minHeight: "100vh" }}>
      <Navbar_Main />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome banner */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 mb-6 relative overflow-hidden shadow-lg border border-pink-100"
          style={{ background: "linear-gradient(135deg,#fdf2f8,#f3e8ff,#eff6ff)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
            style={{ background: "radial-gradient(circle,#f472b6,transparent)" }} />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="chewy text-3xl sm:text-4xl text-purple-700 mb-1">
                {greetingByHour()}, {firstName}! ✨
              </h1>
              <p className="text-base text-purple-500 font-medium">Ready to capture a new memory or open a sealed one? 🎁</p>
              <p className="mt-2 text-xs italic text-purple-300">"{prompts[promptIdx]}"</p>
            </div>
            <div className="text-5xl animate-bounce hidden sm:block" style={{ animationDuration: "3s" }}>🌸</div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Capsules", emoji: "📦", color: "from-pink-100 to-pink-50", border: "border-pink-200", text: "text-pink-700" },
            { label: "Unlocked",       emoji: "🔓", color: "from-emerald-100 to-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
            { label: "Sealed",         emoji: "🔒", color: "from-violet-100 to-violet-50", border: "border-violet-200", text: "text-violet-700" },
            { label: "Shared",         emoji: "💌", color: "from-sky-100 to-sky-50", border: "border-sky-200", text: "text-sky-700" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}>
              <span className="text-2xl">{s.emoji}</span>
              <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Calendar + Recap */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
          <div className="md:col-span-2 bg-white/70 backdrop-blur rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
            <MonthlyRecap />
          </div>
          <div className="md:col-span-3 bg-white/70 backdrop-blur rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
            <MemoryCalendar />
          </div>
        </div>

        {/* Capsule carousel */}
        <div className="mb-6 bg-white/60 backdrop-blur rounded-3xl p-5 border border-pink-100 shadow-sm">
          <h2 className="chewy text-2xl text-pink-600 mb-4">Your Capsules ･ﾟﾟ･ 📦</h2>
          <DashboardMiniCarousel />
        </div>

        {/* Reflection zone */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white/60 backdrop-blur rounded-3xl border border-blue-100 shadow-sm p-5">
            <h2 className="chewy text-2xl text-blue-600 mb-4">Reflection Zone ･ﾟﾟ･ 🪞</h2>
            <RecentMemories />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Notifications */}
            <div className="bg-white/70 backdrop-blur rounded-3xl border border-yellow-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-yellow-500" />
                <h4 className="font-bold text-yellow-700 text-sm">Notifications</h4>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-yellow-50 rounded-2xl px-3 py-2.5 border border-yellow-100">
                    <span className="text-base shrink-0">{n.icon}</span>
                    <div>
                      <p className="text-xs text-yellow-800 font-medium leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-yellow-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood tracker */}
            <div className="bg-white/70 backdrop-blur rounded-3xl border border-pink-100 shadow-sm p-5">
              {user && <MoodTracker user={user} />}
            </div>

            {/* Tip of the day */}
            <div className="rounded-3xl border border-purple-100 shadow-sm p-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#fdf4ff,#ede9ff)" }}>
              <div className="absolute top-2 right-3 text-3xl opacity-20">✨</div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-500" />
                <h4 className="font-bold text-purple-700 text-sm">Tip of the day</h4>
              </div>
              <p className="text-xs text-purple-600 leading-relaxed">{tips[tipIdx]}</p>
            </div>

            {/* Prompt */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="rounded-3xl p-5 border border-pink-200 shadow-sm"
              style={{ background: "linear-gradient(135deg,#fff1f7,#fdf4ff)" }}>
              <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">🌼 Prompt of the day</p>
              <p className="text-sm italic text-pink-700 leading-relaxed">{prompts[promptIdx]}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <FloatingActions onCreate={() => {}} />
    </div>
  );
};

export default Dashboard;
