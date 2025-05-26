import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import dayjs from "dayjs";
import right from "../assets/right.png";

const StoryRecap = ({ photos, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const timeoutRef = React.useRef(null);
  const slideDuration = 4000; // 4 seconds

  React.useEffect(() => {
    if (photos.length === 0) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, slideDuration);

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, photos.length]);

  const goPrev = () => {
    clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNext = () => {
    clearTimeout(timeoutRef.current);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
      {/* Close button OUTSIDE the image container */}
      <button
        className="absolute top-6 right-6 text-white text-4xl font-bold z-50"
        onClick={onClose}
        aria-label="Close recap"
      >
        ×
      </button>

      <div
        className="
          relative
          w-full
          max-w-[900px]  /* max width for large screens */
          rounded-lg
          overflow-hidden
          bg-black
          flex
          flex-col
          items-center
          sm:max-w-[700px] /* medium screens */
          md:max-w-[850px]
          "
        style={{ height: "85vh" }} // tall height, almost full viewport height
      >
        {/* Progress bars - above image */}
        <div className="flex space-x-1 p-2 mb-4 w-full px-4">
          {photos.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded bg-white/40"
              style={{
                flex: 1,
                opacity: i === currentIndex ? 1 : 0.3,
                transition: "opacity 0.3s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {i === currentIndex && (
                <div
                  className="h-full bg-white"
                  style={{
                    width: "100%",
                    animation: `progressBar ${slideDuration}ms linear forwards`,
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Image */}
        {photos.length > 0 ? (
          <img
            src={photos[currentIndex]}
            alt={`Recap photo ${currentIndex + 1}`}
            className="
              w-full
              h-full
              object-contain
              rounded-md
            "
          />
        ) : (
          <div className="text-white p-10 text-center">No photos available</div>
        )}

        {/* Left and right clickable areas */}
        <div
          className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-20"
          onClick={goPrev}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-20"
          onClick={goNext}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};


const MonthlyRecap = () => {
  const [latestMonth, setLatestMonth] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    const fetchLatestMonthRecap = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/photo-memories/get-all-photo', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.data.success) {
          console.error("API call failed");
          return;
        }

        const memories = res.data.data;

        const photosFlat = memories.flatMap(m => m.photos || []);
        setAllPhotos(photosFlat);

        const grouped = {};
        memories.forEach((memory) => {
          const monthKey = dayjs(memory.createdAt).format("YYYY-MM");
          if (!grouped[monthKey]) {
            grouped[monthKey] = [];
          }
          grouped[monthKey].push(memory);
        });

        const keys = Object.keys(grouped);
        if (!keys.length) {
          setLatestMonth({
            month: dayjs().format("MMMM"),
            year: dayjs().format("YYYY"),
            backgroundImage: right,
          });
          return;
        }

        const latestKey = keys.sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())[0];
        const latestMonthMemories = grouped[latestKey];

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

  if (!latestMonth) return null;

  // Pick up to 5 random photos for recap story
  const randomFive = allPhotos.length
    ? allPhotos
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
    : [];

  return (
    <div className="md:col-span-2 mb-8">
      <h2 className="text-2xl quicksand font-semibold text-blue-500 mb-3">
        Monthly Recap Peek ⋆˚｡✩
      </h2>

      <motion.div
        whileHover={{ scale: 1.03 }}
        onClick={() => setShowRecap(true)}
        className="relative w-full h-[290px] rounded-xl overflow-hidden shadow-sm border border-[#dbeafe] bg-white cursor-pointer group"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url('${latestMonth.backgroundImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
        <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-600 px-2 py-1 text-xs rounded-full shadow">
          {latestMonth.month} Recap ✿
        </div>
        <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-white/70 backdrop-blur-sm">
          <p className="text-[13px] text-indigo-700 font-medium chewy">
            Peek into your {latestMonth.month} {latestMonth.year} (๑˃ᴗ˂)ﻭ
          </p>
        </div>
      </motion.div>

      {showRecap && (
        <StoryRecap photos={randomFive} onClose={() => setShowRecap(false)} />
      )}
    </div>
  );
};

export default MonthlyRecap;
