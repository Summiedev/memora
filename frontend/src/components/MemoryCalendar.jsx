// MemoryCalendar.jsx — redesigned
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MemoryCalendar = () => {
  const [memories,      setMemories]      = useState([]);
  const [currentMonth,  setCurrentMonth]  = useState(new Date().getMonth());
  const [currentYear,   setCurrentYear]   = useState(new Date().getFullYear());
  const [selectedDay,   setSelectedDay]   = useState(null);
  const [direction,     setDirection]     = useState(1); // 1 = forward, -1 = back

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/photo-memories/get-all-photo",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setMemories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching memories:", err);
      }
    };
    fetchMemories();
  }, []);

  // Map day → memories for current month
  const memoryByDay = useMemo(() => {
    const map = {};
    memories.forEach((m) => {
      const d = new Date(m.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(m);
      }
    });
    return map;
  }, [memories, currentMonth, currentYear]);

  const changeMonth = (dir) => {
    setDirection(dir);
    setSelectedDay(null);
    const d = new Date(currentYear, currentMonth + dir);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
  };

  const today        = new Date();
  const isThisMonth  = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const firstDayIdx  = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalMemDays = Object.keys(memoryByDay).length;

  const selectedMemories = selectedDay ? (memoryByDay[selectedDay] || []) : [];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="bg-white rounded-3xl border border-violet-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-violet-50 to-blue-50 border-b border-violet-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="chewy text-xl text-violet-700 flex items-center gap-1.5">
              <Sparkles size={16} className="text-violet-400" />
              Memory Calendar
            </h2>
            {totalMemDays > 0 && (
              <p className="text-xs text-gray-400 quicksand mt-0.5">
                {totalMemDays} day{totalMemDays !== 1 ? "s" : ""} with memories this month
              </p>
            )}
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 rounded-xl bg-white border border-violet-100 flex items-center justify-center text-violet-500 hover:bg-violet-100 transition-all shadow-sm"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-gray-700 quicksand min-w-[110px] text-center">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 rounded-xl bg-white border border-violet-100 flex items-center justify-center text-violet-500 hover:bg-violet-100 transition-all shadow-sm"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 quicksand uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentMonth}-${currentYear}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="grid grid-cols-7 gap-1"
          >
            {/* Empty cells before first day */}
            {Array(firstDayIdx).fill("").map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day        = i + 1;
              const hasMemory  = !!memoryByDay[day];
              const count      = memoryByDay[day]?.length || 0;
              const isToday    = isThisMonth && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`
                    relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold
                    transition-all duration-200 quicksand
                    ${isSelected
                      ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-200 scale-105"
                      : hasMemory
                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        : isToday
                          ? "bg-violet-50 text-violet-600 border border-violet-200"
                          : "text-gray-500 hover:bg-gray-50"
                    }
                  `}
                >
                  {isToday && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
                  )}
                  <span>{day}</span>
                  {hasMemory && (
                    <span className={`text-[8px] mt-0.5 ${isSelected ? "text-white/80" : "text-amber-500"}`}>
                      {count > 1 ? `${count}×` : "✦"}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 quicksand">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
            Has memories
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 quicksand">
            <div className="w-3 h-3 rounded bg-violet-100 border border-violet-200" />
            Today
          </div>
        </div>
      </div>

      {/* Selected day preview */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            className="border-t border-violet-100 overflow-hidden"
          >
            <div className="px-4 py-3 bg-violet-50">
              <p className="text-xs font-bold text-violet-700 quicksand mb-2">
                {MONTHS[currentMonth]} {selectedDay} · {selectedMemories.length} memory{selectedMemories.length !== 1 ? "s" : ""}
              </p>
              {selectedMemories.length === 0 ? (
                <p className="text-xs text-gray-400 quicksand italic">No memories on this day.</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {selectedMemories.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      className="text-xs bg-white border border-violet-100 rounded-xl px-2.5 py-1 text-violet-700 quicksand shadow-sm"
                    >
                      {m.title || "Untitled memory"}
                    </div>
                  ))}
                  {selectedMemories.length > 4 && (
                    <div className="text-xs bg-white border border-violet-100 rounded-xl px-2.5 py-1 text-gray-400 quicksand">
                      +{selectedMemories.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryCalendar;
