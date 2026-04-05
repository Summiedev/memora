import React, { useRef, useState } from "react";
import api from '../utils/auth';
import { Pencil, Trash2, Share2, Mic, Play, Pause, Lock, Flame, Eye } from "lucide-react";

export default function DiaryCard({ entry, onView, onDelete, onShare = () => {} }) {
  const { _id, title, content, createdAt, isSecret, voiceNote, emotionTag, burnAfterReading } = entry;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const EMOTION_EMOJI = {
    happy:'😊', peaceful:'😌', anxious:'🥺', sad:'😔',
    angry:'😤', grateful:'🥰', excited:'🤩',
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this diary entry? This can't be undone.")) return;
    try {
      await api.delete(`/diary-entries/${_id}`);
      onDelete(_id);
    } catch (err) {
      console.error("Failed to delete entry:", err);
      alert("Could not delete entry.");
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else         { audioRef.current.play();  setPlaying(true);  }
  };

  return (
    <div
      onClick={onView}
      className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 relative cursor-pointer active:scale-[0.99]"
    >
      {/* Badges row */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[60%]">
        {isSecret && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-black border border-purple-200">
            <Lock size={9} /> Secret
          </span>
        )}
        {burnAfterReading && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-500 text-[10px] font-black border border-red-200">
            🔥 Burn
          </span>
        )}
        {emotionTag && (
          <span className="px-2 py-0.5 rounded-full bg-white/80 text-[11px] border border-blue-100">
            {EMOTION_EMOJI[emotionTag] || '💭'}
          </span>
        )}
      </div>

      {/* Action icons top right */}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="w-7 h-7 rounded-lg bg-white/80 hover:bg-blue-50 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
          title="View / Edit"
        >
          <Eye size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(entry); }}
          className="w-7 h-7 rounded-lg bg-white/80 hover:bg-blue-50 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
          title="Share"
        >
          <Share2 size={13} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-7 h-7 rounded-lg bg-white/80 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm active:scale-90"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-7">
        <h3 className="quicksand text-base font-bold text-blue-700 mb-1 pr-2 line-clamp-2">
          ✧ {title}
        </h3>
        <p className="text-blue-400 text-[10px] italic mb-3">
          {new Date(createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
        </p>

        {isSecret ? (
          <div className="flex items-center gap-2 py-3 px-3 rounded-xl bg-purple-100/60 border border-purple-200">
            <Lock size={14} className="text-purple-500" />
            <p className="text-purple-600 text-xs font-semibold italic">Secret entry — tap to view</p>
          </div>
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 dancing-script" style={{ fontSize:'1rem' }}>
            {content}
          </p>
        )}

        {/* Voice note player */}
        {voiceNote?.url && !isSecret && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-blue-100">
            <button onClick={togglePlay}
              className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0">
              {playing ? <Pause size={10} /> : <Play size={10} />}
            </button>
            <Mic size={12} className="text-blue-400 flex-shrink-0" />
            <span className="text-[11px] text-blue-500 font-semibold">Voice note</span>
            {voiceNote.duration && (
              <span className="text-[10px] text-blue-300 ml-auto">
                {Math.floor(voiceNote.duration / 60)}:{String(voiceNote.duration % 60).padStart(2,'0')}
              </span>
            )}
            <audio ref={audioRef} src={voiceNote.url} onEnded={() => setPlaying(false)} className="hidden" />
          </div>
        )}

        {/* Tap hint */}
        <div className="mt-3 flex items-center gap-1 text-[10px] text-blue-300 font-semibold">
          <Pencil size={9} /> Tap to view &amp; edit
        </div>
      </div>
    </div>
  );
}
