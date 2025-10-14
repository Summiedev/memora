import React, { useEffect } from 'react';

const MemoraLoaderOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center">
      {/* Animated Spinner */}
      <div className="relative flex flex-col items-center">
        {/* Spinning ring */}
        <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-6"></div>

        {/* Bubble animations */}
        <div className="absolute w-full h-full">
          <div className="absolute w-3 h-3 bg-blue-300 rounded-full top-6 left-12 animate-ping delay-100"></div>
          <div className="absolute w-4 h-4 bg-blue-200 rounded-full bottom-10 right-16 animate-ping delay-200"></div>
          <div className="absolute w-2 h-2 bg-blue-400 rounded-full top-12 right-10 animate-ping delay-300"></div>
          <div className="absolute w-3 h-3 bg-blue-300 rounded-full bottom-16 left-20 animate-ping delay-500"></div>
        </div>

        {/* Text message */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-600 chewy animate-fade-in-up">
            Logging you in, sweet friend ₊˚⊹♡
          </h2>
          <p className="text-blue-500 text-sm mt-2 animate-fade-in-up delay-200">
            Just a moment... your memories await ☁️
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemoraLoaderOverlay;
