import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const ViewCapsule = ({ onClose, capsule }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    if (capsule.sharedBy) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Set initial locked state
    if (capsule.unlockDate) {
      const unlockDate = new Date(capsule.unlockDate);
      const now = new Date();
      if (now >= unlockDate) setIsUnlocked(true);

      // Countdown Timer
      const timer = setInterval(() => {
        const difference = unlockDate - new Date();
        if (difference <= 0) {
          setIsUnlocked(true);
          clearInterval(timer);
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [capsule]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] flex justify-center items-center px-4 py-10">
      {showConfetti && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 bg-white w-full max-w-3xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {capsule.title}
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          Created on {formatDate(capsule.createdAt)}
        </p>

        {isUnlocked ? (
          <div>
            {/* Unlocked Features */}
            <p className="text-green-600 font-semibold mb-4">Capsule Unlocked</p>
            <p>{capsule.message}</p>

            {capsule.coverImage && (
              <img
                src={capsule.coverImage}
                alt="Capsule visual"
                className="w-full rounded-lg mb-4"
              />
            )}

            <div className="mt-4 space-y-2">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
                Download & Export
              </button>
              <button className="w-full py-2 px-4 bg-gray-100 text-blue-600 rounded-md">
                Add a New Entry
              </button>
              <button className="w-full py-2 px-4 bg-gray-100 text-blue-600 rounded-md">
                Re-Lock Capsule
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Locked Features */}
            <p className="text-red-600 font-semibold mb-4">Capsule Locked</p>
            <ul className="space-y-2">
              <li>⏳ Countdown Timer: <strong>{remainingTime}</strong></li>
              <li>👀 Preview Metadata Only</li>
              <li>
                📝 Edit Unlock Settings
                <button className="ml-2 text-blue-500 underline">Change Date</button>
              </li>
              <li>🔒 Share & Permissions Preview</li>
              <li>
                ❌ Delete or Cancel 
                <button className="ml-2 text-red-500 underline">Delete Capsule</button>
              </li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewCapsule;
