import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import dayjs from "dayjs";
import right from "../assets/right.png";
const MonthlyRecap = () => {
  const [latestMonth, setLatestMonth] = useState(null);

  useEffect(() => {
    const fetchLatestMonthRecap = async () => {
      try {
        const res =await axios.get('http://localhost:5000/api/photo-memories/get-all-photo', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },});
            console.log("API response:", res); 

        if (!res.data.success) {
          console.error("API call failed");
          return;
        }

        const memories = res.data.data;

        // Group by month: YYYY-MM
        const grouped = {};
        memories.forEach((memory) => {
          const monthKey = dayjs(memory.createdAt).format("YYYY-MM");
          if (!grouped[monthKey]) {
            grouped[monthKey] = [];
          }
          grouped[monthKey].push(memory);
        });

        // Get the latest month key
        const latestKey = Object.keys(grouped)
          .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())[0];

        const latestMonthMemories = grouped[latestKey];

        // Use the first photo from the first memory as a background preview
        const backgroundImage =
          latestMonthMemories.find(m => m.photos?.length)?.photos[0] ?? right;

        const readableMonth = dayjs(latestKey).format("MMMM");
        const readableYear = dayjs(latestKey).format("YYYY");

        setLatestMonth({
          month: readableMonth,
          year: readableYear,
          backgroundImage,
        });
      } catch (err) {
        console.error("Failed to fetch monthly recap:", err);
      }
    };

    fetchLatestMonthRecap();
  }, []);

  if (!latestMonth) return null; // or loading spinner

  return (
    <div className="md:col-span-2 mb-8">
      <h2 className="text-2xl quicksand font-semibold text-blue-500 mb-3">
        Monthly Recap Peek ⋆˚｡✩
      </h2>

      <motion.div
        whileHover={{ scale: 1.03 }}
        onClick={() => console.log("Open Monthly Recap")}
        className="relative w-full h-[290px] rounded-xl overflow-hidden shadow-sm border border-[#dbeafe] bg-white cursor-pointer group"
      >
        {/* Background Image Teaser */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url('${latestMonth.backgroundImage}')` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />

        {/* Side Tag */}
        <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-600 px-2 py-1 text-xs rounded-full shadow">
          {latestMonth.month} Recap ✿
        </div>

        {/* Bottom Caption */}
        <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-white/70 backdrop-blur-sm">
          <p className="text-[13px] text-indigo-700 font-medium chewy">
            Peek into your {latestMonth.month} {latestMonth.year} (๑˃ᴗ˂)ﻭ
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MonthlyRecap;
