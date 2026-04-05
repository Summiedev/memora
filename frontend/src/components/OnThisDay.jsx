import React, { useEffect, useState } from "react";
import api from '../utils/auth';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Mic, Play, Pause, Lock } from "lucide-react";

const EMOTION_COLORS = {
  happy:    { bg:'#fef9c3', border:'#fde047', text:'#854d0e' },
  peaceful: { bg:'#d1fae5', border:'#6ee7b7', text:'#064e3b' },
  anxious:  { bg:'#ede9fe', border:'#c4b5fd', text:'#4c1d95' },
  sad:      { bg:'#f1f5f9', border:'#94a3b8', text:'#1e293b' },
  angry:    { bg:'#fee2e2', border:'#fca5a5', text:'#7f1d1d' },
  grateful: { bg:'#fce7f3', border:'#f9a8d4', text:'#831843' },
  excited:  { bg:'#ffedd5', border:'#fdba74', text:'#7c2d12' },
};

function MemoryCard({ entry, idx }) {
  const [playing, setPlaying]   = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [pin, setPin]           = useState("");
  const [unlocked, setUnlocked] = useState(!entry.isSecret);
  const [data, setData]         = useState(entry);
  const audioRef = React.useRef(null);

  const colors = EMOTION_COLORS[entry.emotionTag] || { bg:'#f8fafc', border:'#e2e8f0', text:'#334155' };

  const doUnlock = async () => {
    try {
      const res = await api.post('/diary-entries/${entry._id}/unlock', { pin });
      setData(res.data.data);
      setUnlocked(true);
    } catch { alert("Wrong PIN 🔒"); }
  };

  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.08 }}
      className="rounded-2xl border-2 p-4 relative overflow-hidden"
      style={{ background: colors.bg, borderColor: colors.border }}>

      {/* Years ago badge */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black"
        style={{ background: colors.border, color: colors.text }}>
        {entry.yearsAgo}y ago
      </div>

      {entry.isSecret && !unlocked ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Lock size={24} style={{ color: colors.text }} />
          <p className="text-xs font-bold" style={{ color: colors.text }}>Secret Entry</p>
          {!unlocking ? (
            <button onClick={() => setUnlocking(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
              style={{ background: colors.border }}>
              Unlock
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input type="password" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/,''))}
                placeholder="PIN" className="w-20 px-2 py-1 rounded-lg border text-center text-sm font-bold tracking-widest outline-none" />
              <button onClick={doUnlock} className="px-2 py-1 rounded-lg text-xs font-bold text-white bg-purple-500">Go</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <h3 className="font-black text-sm mb-1 pr-12" style={{ color: colors.text }}>{data.title}</h3>
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: colors.text, opacity:0.8 }}>{data.content}</p>

          {/* Voice note */}
          {data.voiceNote?.url && (
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => { if(playing){ audioRef.current?.pause(); setPlaying(false); } else { audioRef.current?.play(); setPlaying(true); } }}
                className="p-1.5 rounded-lg text-white" style={{ background: colors.border }}>
                {playing ? <Pause size={10} /> : <Play size={10} />}
              </button>
              <Mic size={11} style={{ color: colors.text }} />
              <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Voice note</span>
              <audio ref={audioRef} src={data.voiceNote.url} onEnded={() => setPlaying(false)} className="hidden" />
            </div>
          )}
        </>
      )}

      {/* Emotion context */}
      <p className="mt-3 text-[10px] italic leading-snug" style={{ color: colors.text, opacity:0.7 }}>
        {entry.emotionContext}
      </p>
    </motion.div>
  );
}

export default function OnThisDay() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const PER = 2;

  useEffect(() => {
    api.get('/diary-entries/on-this-day')
      .then(r => setEntries(r.data.data || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="rounded-3xl bg-white/80 border-2 border-amber-100 shadow-md p-5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} className="text-amber-500" />
        <span className="font-black text-sm text-amber-700">On This Day</span>
      </div>
      <div className="space-y-2">
        {[0,1].map(i => <div key={i} className="h-20 rounded-2xl bg-amber-50 animate-pulse" />)}
      </div>
    </div>
  );

  if (entries.length === 0) return null;

  const pages    = Math.ceil(entries.length / PER);
  const visible  = entries.slice(page*PER, page*PER + PER);
  const today    = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric' });

  return (
    <div className="rounded-3xl border-2 border-amber-100 shadow-md p-5 overflow-hidden"
      style={{ background:'linear-gradient(135deg,#fffbeb,#fff7f0)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗓️</span>
          <div>
            <h4 className="font-black text-sm text-amber-800">On This Day</h4>
            <p className="text-[10px] text-amber-600">{today} · {entries.length} memor{entries.length===1?'y':'ies'}</p>
          </div>
        </div>
        {pages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
              className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-30 transition-colors">
              <ChevronLeft size={12} className="text-amber-700" />
            </button>
            <span className="text-[10px] text-amber-600 font-bold">{page+1}/{pages}</span>
            <button onClick={() => setPage(p => Math.min(pages-1,p+1))} disabled={page===pages-1}
              className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-30 transition-colors">
              <ChevronRight size={12} className="text-amber-700" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {visible.map((e, i) => <MemoryCard key={e._id} entry={e} idx={i} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
