import React from 'react';

const MemoraLoaderOverlay = ({ message = "Just a moment... your memories await ☁️" }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "linear-gradient(160deg,#fce4f3 0%,#ede9ff 50%,#dbeafe 100%)" }}>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-30 blur-3xl animate-pulse"
        style={{ background: "radial-gradient(circle,#f9a8d4,transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-25 blur-3xl animate-pulse"
        style={{ background: "radial-gradient(circle,#c4b5fd,transparent)", animationDelay:"1s" }} />

      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-pink-200" />
          <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-transparent border-b-purple-400 border-l-pink-400 animate-spin"
            style={{ animationDirection:"reverse", animationDuration:"0.8s" }} />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🌸</div>
        </div>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ background:["#ec4899","#8b5cf6","#3b82f6"][i], animationDelay:`${i*0.15}s`, animationDuration:"0.8s" }} />
          ))}
        </div>
        <div className="text-center px-6">
          <h2 className="chewy text-2xl text-purple-700 mb-1">Loading Memora ✨</h2>
          <p className="text-sm text-purple-400 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MemoraLoaderOverlay;
