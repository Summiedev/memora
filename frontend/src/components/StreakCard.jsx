import React from "react";
import { Flame, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakCard({ streak }) {
  if (!streak) return null;
  const { currentStreak = 0, longestStreak = 0, totalEntries = 0 } = streak;

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || null;
  const pct = nextMilestone ? Math.round((currentStreak / nextMilestone) * 100) : 100;

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className="rounded-3xl border-2 border-orange-100 shadow-md p-5 overflow-hidden relative"
      style={{ background:'linear-gradient(135deg,#fff7ed,#fff1f2)' }}>

      {/* Decorative flame */}
      <div className="absolute -right-4 -top-4 text-8xl opacity-5 select-none">🔥</div>

      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-orange-500" />
        <h4 className="font-black text-sm text-orange-800 uppercase tracking-wide">Memory Streak</h4>
      </div>

      {/* Main streak */}
      <div className="flex items-end gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center gap-1">
            <span className="text-4xl font-black text-orange-600 chewy">{currentStreak}</span>
            <Flame size={20} className="text-orange-400 mb-1" />
          </div>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Day streak</p>
        </div>
        <div className="w-px h-10 bg-orange-100" />
        <div className="text-center">
          <div className="text-2xl font-black text-pink-600 chewy">{longestStreak}</div>
          <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wide">Best</p>
        </div>
        <div className="w-px h-10 bg-orange-100" />
        <div className="text-center">
          <div className="text-2xl font-black text-purple-600 chewy">{totalEntries}</div>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Entries</p>
        </div>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-orange-600 font-semibold">
              {nextMilestone - currentStreak} days to {nextMilestone}-day streak 🏆
            </span>
            <span className="text-[10px] text-orange-500 font-bold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, ease:'easeOut' }}
              className="h-full rounded-full"
              style={{ background:'linear-gradient(90deg,#fb923c,#ec4899)' }} />
          </div>
        </div>
      )}

      {currentStreak === 0 && (
        <p className="text-xs text-orange-500 font-medium mt-1">
          Write your first entry today to start your streak! 🌱
        </p>
      )}
      {currentStreak > 0 && currentStreak >= (longestStreak || 0) && (
        <p className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
          <Award size={11} /> New personal best — keep going! 🔥
        </p>
      )}
    </motion.div>
  );
}
