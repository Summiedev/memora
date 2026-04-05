import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles, ChevronRight, Plus, BookOpen, Camera, Pencil,
  RefreshCw, Send, Check, Lock, Unlock, Share2
} from "lucide-react";
import MobileBottomNav from "../components/MobileBottomNav";
import Navbar_Main from "../components/Navbar_main";
import { motion, AnimatePresence } from "framer-motion";
import FloatingActions from "../components/FloatingBtn";
import { useLocation } from "react-router-dom";
import DashboardMiniCarousel from "../components/DashboardCaraousel";
import RecentMemories from "../components/RecentMemories";
import MemoryCalendar from "../components/MemoryCalendar";
import MonthlyRecap from "../components/MonthlyRecap";
import MoodTracker from '../components/MoodTracker';
import ViewCapsuleModal from '../components/ViewCapsuleModal';
import TimeCapsuleModal from '../components/CreateCapsuleForm';
import PhotoAlbumForm from '../components/PhotoAlbumForm';
import { DiaryEntryForm } from '../components/DiaryEntryForm';
import OnThisDay from '../components/OnThisDay';
import StreakCard from '../components/StreakCard';
import GroupDiary from '../components/GroupDiary';
import axios from "axios";
import api from "../utils/auth";

// ── Prompts pool ────────────────────────────────────────────────────────────
const PROMPTS = [
  { text: "What made you smile today?",                 emoji: "☀️" },
  { text: "Who are you grateful for right now?",        emoji: "💛" },
  { text: "What's one small win you're proud of?",      emoji: "🌟" },
  { text: "Describe a perfect moment from this week",   emoji: "🌸" },
  { text: "What's something you want to remember forever?", emoji: "💌" },
  { text: "What song perfectly describes your mood?",   emoji: "🎵" },
  { text: "Write a letter to your future self",         emoji: "📝" },
  { text: "What's a dream you're chasing right now?",   emoji: "🦋" },
  { text: "What made this week worth remembering?",     emoji: "✨" },
  { text: "Describe where you are in life right now",   emoji: "🗺️" },
];

const TIPS = [
  "Add a lock date to your capsule so it stays sealed until the right moment 🔒",
  "Share a capsule with a friend — they'll love the surprise 💌",
  "Use emotion tags so you can find memories by how they felt 🎭",
  "Write a letter to your future self — your future you will thank you 🌟",
];

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

// ── Tiny helpers ────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, count, grad, border, tc, delay, onClick }) => (
  <motion.button onClick={onClick}
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
    className={`w-full text-left rounded-3xl p-5 border-2 ${border} shadow-md hover:shadow-xl transition-all`}
    style={{ background: grad }}>
    <div className="text-3xl mb-3">{emoji}</div>
    <div className={`text-4xl font-black chewy ${tc} leading-none mb-1`}>{count ?? <span className="opacity-30">—</span>}</div>
    <div className={`text-xs font-bold ${tc} opacity-70 uppercase tracking-wide`}>{label}</div>
  </motion.button>
);

// ── Prompt card with inline response ───────────────────────────────────────
const PromptCard = ({ prompt, onSave, onNext }) => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const ta = useRef(null);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(prompt, text);
      setSaved(true);
      setTimeout(() => { setSaved(false); setText(''); }, 2000);
    } finally { setSaving(false); }
  };

  return (
    <motion.div key={prompt.text}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 border-pink-100 overflow-hidden shadow-md"
      style={{ background: 'linear-gradient(135deg,#fff5fa,#fdf0ff,#f0f5ff)' }}>
      {/* Prompt header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{prompt.emoji}</span>
          <div>
            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">🌼 Today's Prompt</p>
            <p className="text-base font-bold text-purple-800 leading-snug">{prompt.text}</p>
          </div>
        </div>
        <button onClick={onNext} title="New prompt"
          className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-500 transition-colors mt-0.5">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Text area */}
      <div className="px-5 pb-2">
        <textarea ref={ta} value={text} onChange={e => setText(e.target.value)}
          placeholder="Write your answer here… pour your heart out ♡"
          rows={4}
          className="w-full resize-none bg-white/70 rounded-2xl border-2 border-purple-100 focus:border-pink-300 focus:ring-4 focus:ring-pink-50 outline-none px-4 py-3 text-sm text-purple-900 placeholder-purple-300 leading-relaxed transition-all"
          style={{ fontFamily: "'Quicksand', sans-serif" }} />
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <p className="text-xs text-purple-300 font-medium">{text.length > 0 ? `${text.length} chars` : 'Start typing…'}</p>
        <button onClick={handleSave} disabled={!text.trim() || saving || saved}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow transition-all hover:scale-105 disabled:opacity-50 ${saved ? 'bg-emerald-500' : ''}`}
          style={!saved ? { background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' } : {}}>
          {saved ? <><Check size={14}/> Saved!</> : saving ? 'Saving…' : <><Send size={13}/> Save to Diary</>}
        </button>
      </div>
    </motion.div>
  );
};


const Dashboard = () => {
  const [user,          setUser]          = useState(null);
  const [capsuleStats,  setCapsuleStats]  = useState({ total: 0, unlocked: 0, locked: 0, shared: 0 });
  const [memoryTrigger, setMemoryTrigger] = useState(0);
  const [promptIdx,     setPromptIdx]     = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [tipIdx]                          = useState(() => Math.floor(Math.random() * TIPS.length));
  const [streak,        setStreak]        = useState(null);

  // modals
  const [showCapsuleForm,  setShowCapsuleForm]  = useState(false);
  const [showMemoryPicker, setShowMemoryPicker] = useState(false);
  const [memoryType,       setMemoryType]       = useState(null);
  const [viewCapsuleId,    setViewCapsuleId]    = useState(null);
  const [showViewModal,    setShowViewModal]    = useState(false);

  const { search, pathname } = useLocation();

  // scrub token from URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.has("token")) {
      params.delete("token");
      window.history.replaceState({}, document.title, pathname + (params.toString() ? `?${params}` : ""));
    }
  }, [search, pathname]);

  // load user
  useEffect(() => {
    api.get('/auth/profile')
      .then(r => setUser(r.data.data || r.data.user)).catch(() => {});
    // load streak
    api.get('/diary-entries/streak')
      .then(r => setStreak(r.data.data)).catch(() => {});
  }, []);

  // Re-fetch when tab becomes visible (no refresh needed)


  // load capsule counts
  const fetchCapsules = useCallback(async () => {
    try {
      const res = await api.get('/capsules/all-capsules');
      const caps = res.data.capsules || [];
      const now  = new Date();
      setCapsuleStats({
        total:    caps.length,
        unlocked: caps.filter(c => !c.lockUntilSend || new Date(c.sendDate) <= now).length,
        locked:   caps.filter(c =>  c.lockUntilSend && new Date(c.sendDate) >  now).length,
        shared:   caps.filter(c => c.capsuleType === 'shared').length,
      });
    } catch {
    }
  }, []);
  
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        api.get('/auth/profile').then(r => setUser(r.data.data || r.data.user)).catch(() => {});
        fetchCapsules();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchCapsules]);
  useEffect(() => { fetchCapsules(); }, [fetchCapsules]);

  const firstName = user?.fullname?.split(' ')[0] || user?.username || 'friend';
  const prompt    = PROMPTS[promptIdx];

  // Save prompt response as a diary entry
  const handlePromptSave = async (p, text) => {
    const { data } = await api.post('/diary-entries/create-diary', {
      title: p.text,
      entryText: text,
      date: new Date().toISOString(),
    });
    if (data.streak) setStreak(data.streak);
    setMemoryTrigger(t => t + 1);
  };

  const nextPrompt = () => {
    let next = promptIdx;
    while (next === promptIdx) next = Math.floor(Math.random() * PROMPTS.length);
    setPromptIdx(next);
  };

  const handleMemoryCreated = () => {
    setMemoryTrigger(t => t + 1);
    setMemoryType(null);
    setShowMemoryPicker(false);
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'linear-gradient(160deg,#fdf0f9 0%,#f0ebff 45%,#e8f4ff 100%)', minHeight: '100vh' }}>
      <Navbar_Main />
      <MobileBottomNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6 space-y-5">

        {/* ── WELCOME BANNER ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-xl border-2 border-pink-100"
          style={{ background: 'linear-gradient(135deg,#fff0f9,#f5f0ff,#eef6ff)' }}>

          {/* decorative blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#f472b6,transparent)' }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar bubble */}
              <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                {user?.fullname?.[0]?.toUpperCase() || '✨'}
              </div>
              <div>
                <h1 className="chewy text-2xl sm:text-3xl text-purple-800 leading-tight">
                  {greetingByHour()}, {firstName}! ✨
                </h1>
                <p className="text-xs sm:text-sm text-purple-500 font-semibold mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick create buttons */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowCapsuleForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg"
                style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                <Plus size={15} /> Capsule
              </motion.button>
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowMemoryPicker(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
                <BookOpen size={15} /> Memory
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard emoji="📦" label="Total"    count={capsuleStats.total}
            grad="linear-gradient(135deg,#fce7f3,#fdf4ff)"
            border="border-pink-200" tc="text-pink-700" delay={0}
            onClick={() => window.location.href = '/capsules'} />
          <StatCard emoji="🔓" label="Unlocked" count={capsuleStats.unlocked}
            grad="linear-gradient(135deg,#d1fae5,#ecfdf5)"
            border="border-emerald-200" tc="text-emerald-700" delay={0.07}
            onClick={() => window.location.href = '/capsules'} />
          <StatCard emoji="🔒" label="Sealed"   count={capsuleStats.locked}
            grad="linear-gradient(135deg,#ede9fe,#faf5ff)"
            border="border-violet-200" tc="text-violet-700" delay={0.14}
            onClick={() => window.location.href = '/capsules'} />
          <StatCard emoji="💌" label="Shared"   count={capsuleStats.shared}
            grad="linear-gradient(135deg,#e0f2fe,#eff6ff)"
            border="border-sky-200" tc="text-sky-700" delay={0.21}
            onClick={() => window.location.href = '/capsules'} />
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── LEFT COLUMN (2/3) ──────────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-5">

            {/* PROMPT CARD — working journal */}
            <PromptCard prompt={prompt} onSave={handlePromptSave} onNext={nextPrompt} />

            {/* CAPSULE CAROUSEL */}
            <div className="bg-white/85 backdrop-blur rounded-3xl border-2 border-pink-100 shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="chewy text-xl text-pink-600">My Capsules 📦</h2>
                <a href="/capsules" className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-700 transition-colors">
                  View all <ChevronRight size={13} />
                </a>
              </div>
              {capsuleStats.total === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 text-center">
                  <div className="text-5xl">🌱</div>
                  <p className="text-sm font-semibold text-purple-600">No capsules yet!</p>
                  <p className="text-xs text-purple-400">Create your first one and seal a memory forever</p>
                  <button onClick={() => setShowCapsuleForm(true)}
                    className="mt-1 px-5 py-2 rounded-2xl text-white text-sm font-bold shadow-md hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                    Create Capsule ✦
                  </button>
                </div>
              ) : (
                <DashboardMiniCarousel onCapsuleClick={(id) => { setViewCapsuleId(id); setShowViewModal(true); }} />
              )}
            </div>

            {/* CALENDAR */}
            <div className="bg-white/85 backdrop-blur rounded-3xl border-2 border-blue-100 shadow-md overflow-hidden">
              <MemoryCalendar />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR (1/3) ────────────────────────────────────── */}
          <div className="space-y-4">

            {/* MOOD TRACKER */}
            <div className="bg-white/85 backdrop-blur rounded-3xl border-2 border-pink-100 shadow-md p-5">
              {user ? <MoodTracker user={user} /> : (
                <div className="h-32 flex items-center justify-center text-purple-300 text-sm">Loading…</div>
              )}
            </div>

            {/* STREAK CARD */}
            {streak !== null && <StreakCard streak={streak} />}

            {/* ON THIS DAY */}
            <OnThisDay />

            {/* GROUP DIARIES */}
            <GroupDiary me={user} />

            {/* MONTHLY RECAP */}
           <div className="relative z-0 bg-white/85 backdrop-blur rounded-3xl border-2 border-purple-100 shadow-md overflow-hidden">
  <MonthlyRecap />
</div>

            {/* TIP OF THE DAY */}
            <div className="rounded-3xl border-2 border-amber-100 shadow-md p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#fffbeb,#fdf0ff)' }}>
              <div className="absolute -top-3 -right-3 text-5xl opacity-10 select-none rotate-12">💡</div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-amber-500" />
                <h4 className="font-black text-amber-700 text-xs uppercase tracking-wider">Tip of the day</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">{TIPS[tipIdx]}</p>
            </div>

            {/* RECENT MEMORIES STRIP */}
            <div className="bg-white/85 backdrop-blur rounded-3xl border-2 border-teal-100 shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="chewy text-base text-teal-700">Recent Memories 🪞</h4>
                <a href="/memories" className="flex items-center gap-1 text-[10px] font-bold text-teal-500 hover:text-teal-700 transition-colors">
                  All <ChevronRight size={11} />
                </a>
              </div>
              <RecentMemories newEntryTrigger={memoryTrigger} compact />
            </div>

          </div>
        </div>

      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <FloatingActions onCreate={() => { fetchCapsules(); setMemoryTrigger(t => t + 1); }} />

      {/* ── CREATE CAPSULE MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCapsuleForm && (
          <TimeCapsuleModal isOpen={showCapsuleForm} closeModal={() => setShowCapsuleForm(false)}
            addCapsule={() => { fetchCapsules(); setShowCapsuleForm(false); }} />
        )}
      </AnimatePresence>

      {/* ── MEMORY TYPE PICKER ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showMemoryPicker && !memoryType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(139,92,246,0.2)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowMemoryPicker(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
              <div className="p-6 relative">
                <button onClick={() => setShowMemoryPicker(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-purple-50 hover:bg-pink-50 text-purple-400 font-bold text-xl">×</button>
                <h2 className="chewy text-2xl text-purple-700 mb-1">Create a Memory ✨</h2>
                <p className="text-xs text-purple-400 mb-5">Choose your style</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setMemoryType("photo")}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 hover:scale-105 transition-all text-pink-700">
                    <Camera size={26} />
                    <div className="text-center"><p className="font-bold text-sm">Photo Album</p><p className="text-xs text-pink-400 mt-0.5">Upload pictures</p></div>
                  </button>
                  <button onClick={() => setMemoryType("diary")}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:scale-105 transition-all text-purple-700">
                    <Pencil size={26} />
                    <div className="text-center"><p className="font-bold text-sm">Diary Entry</p><p className="text-xs text-purple-400 mt-0.5">Write it down</p></div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MEMORY FORMS ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMemoryPicker && memoryType === 'photo' && (
          <PhotoAlbumForm closeForm={() => { setMemoryType(null); setShowMemoryPicker(false); }} onCreate={handleMemoryCreated} />
        )}
        {showMemoryPicker && memoryType === 'diary' && (
          <DiaryEntryForm closeForm={() => { setMemoryType(null); setShowMemoryPicker(false); }} onCreate={handleMemoryCreated} />
        )}
      </AnimatePresence>

      {/* ── VIEW CAPSULE ────────────────────────────────────────────────── */}
      {showViewModal && viewCapsuleId && (
        <ViewCapsuleModal isOpen={showViewModal} closeModal={() => setShowViewModal(false)} capsuleId={viewCapsuleId} />
      )}
    </div>
  );
};

export default Dashboard;
