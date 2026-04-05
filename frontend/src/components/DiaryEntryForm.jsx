import React, { useState, useRef, useEffect } from "react";
import api from '../utils/auth';
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Save, X, Mic, MicOff, Lock, Play, Pause, Square, Flame } from "lucide-react";

const STICKERS = ['🌸','✨','💌','🎀','🌷','⭐','🦋','🌈','💫','🍀','🌙','☀️','🎵','💝','🌺'];
const MOODS = [
  { emoji:'😊', label:'happy',   display:'Happy',    color:'#fbbf24' },
  { emoji:'😌', label:'peaceful',display:'Peaceful', color:'#34d399' },
  { emoji:'🥺', label:'anxious', display:'Anxious',  color:'#a78bfa' },
  { emoji:'😔', label:'sad',     display:'Sad',      color:'#64748b' },
  { emoji:'😤', label:'angry',   display:'Frustrated',color:'#f87171'},
  { emoji:'🥰', label:'grateful',display:'Grateful', color:'#f472b6' },
  { emoji:'🤩', label:'excited', display:'Excited',  color:'#fb923c' },
];

const BASE = "http://localhost:5000/api";

// ── Voice Recorder Component ─────────────────────────────────────────────────
function VoiceRecorder({ onRecorded, existingUrl }) {
  const [state, setState]   = useState("idle"); // idle | recording | preview
  const [seconds, setSeconds] = useState(0);
  const [blobUrl, setBlobUrl] = useState(existingUrl || null);
  const [playing, setPlaying] = useState(false);
  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const timerRef   = useRef(null);
  const audioRef   = useRef(null);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        setBlobUrl(url);
        onRecorded({ blob, duration: seconds });
        setState("preview");
      };
      mr.start();
      setState("recording");
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      alert("Microphone access denied 🎙️");
    }
  };

  const stopRec = () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else         { audioRef.current.play();  setPlaying(true);  }
  };

  const discard = () => {
    setBlobUrl(null); setState("idle"); setSeconds(0);
    onRecorded(null);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {state === "idle" && (
        <button type="button" onClick={startRec}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 border-2 border-pink-200 text-pink-600 hover:bg-pink-100 transition-all text-xs font-bold">
          <Mic size={14} /> Add Voice Note
        </button>
      )}
      {state === "recording" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border-2 border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-600 text-xs font-bold">{fmt(seconds)}</span>
          <button type="button" onClick={stopRec}
            className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            <Square size={10} />
          </button>
        </div>
      )}
      {state === "preview" && blobUrl && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200">
          <Mic size={12} className="text-emerald-600" />
          <span className="text-emerald-700 text-xs font-bold">{fmt(seconds)}</span>
          <button type="button" onClick={togglePlay}
            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
            {playing ? <Pause size={10} /> : <Play size={10} />}
          </button>
          <button type="button" onClick={discard}
            className="text-xs text-red-400 hover:text-red-600 font-bold">✕</button>
          <audio ref={audioRef} src={blobUrl} onEnded={() => setPlaying(false)} className="hidden" />
        </div>
      )}
      {existingUrl && state === "idle" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-200">
          <Mic size={12} className="text-blue-600" />
          <span className="text-blue-700 text-xs font-bold">Voice attached</span>
          <audio controls src={existingUrl} className="h-6" style={{ width: 100 }} />
        </div>
      )}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export function DiaryEntryForm({ closeForm, onCreate, groupId }) {
  const [title, setTitle]         = useState("");
  const [entryText, setEntryText] = useState("");
  const [mood, setMood]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSecret, setIsSecret]   = useState(false);
  const [pin, setPin]             = useState("");
  const [burnAfter, setBurnAfter] = useState(false);
  const [voiceData, setVoiceData] = useState(null);
  const [streak, setStreak]       = useState(null);
  const textRef = useRef(null);
  const MAX = 3000;

  useEffect(() => {
    api.get('/diary-entries/streak')
      .then(r => setStreak(r.data.data)).catch(() => {});
  }, []);

  const insertText = (text) => {
    const ta = textRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = entryText.slice(0,s) + text + entryText.slice(e);
    setEntryText(next); setCharCount(next.length);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + text.length; ta.focus(); }, 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim())     { alert("Give your entry a title ✦"); return; }
    if (!entryText.trim() && !voiceData) { alert("Write something or record a voice note ♡"); return; }
    if (isSecret && pin.length !== 4) { alert("PIN must be exactly 4 digits 🔒"); return; }

    try {
      setLoading(true);

      let voiceNoteUrl = null, voiceNotePublicId = null, voiceNoteDuration = null;

      // Upload voice note to cloudinary if present
      if (voiceData?.blob) {
 const sigRes = await api.get(
        '/cloudinary-signature/signature/voice'
      );
        const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data;

   const fd = new FormData();
fd.append('file', voiceData.blob);
fd.append('api_key', apiKey);
fd.append('timestamp', timestamp);
fd.append('signature', signature);
fd.append('folder', folder);


    // 3️⃣ Upload to Cloudinary
    const upRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // 4️⃣ Return the uploaded file info
    
      voiceNoteUrl= upRes.data.secure_url,
      voiceNotePublicId= upRes.data.public_id,
      voiceNoteDuration= voiceData.duration
    
        // Get Cloudinary signature


         
      }

      const payload = {
        title, entryText, emotionTag: mood?.label || null,
        date: new Date().toISOString(),
        isSecret, pin: isSecret ? pin : undefined,
        burnAfterReading: burnAfter,
        voiceNoteUrl, voiceNotePublicId, voiceNoteDuration,
        groupId: groupId || undefined
      };

     const { data } = await api.post(
  '/diary-entries/create-diary',
  payload
);

      setShowSuccess(true);
      if (data.streak) setStreak(data.streak);
      setTimeout(() => { onCreate && onCreate(data.data); closeForm(); }, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pct = (charCount / MAX) * 100;
  const circumference = 2 * Math.PI * 14;
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(109,40,217,0.18)', backdropFilter:'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>

      <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="w-full sm:max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight:'95vh', borderRadius:'24px 24px 0 0', background:'#fffdf9' }}
        onClick={e => e.stopPropagation()}>

        <div className="h-1.5 flex-shrink-0" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd,#6ee7b7,#fcd34d)' }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-amber-100"
          style={{ background:'linear-gradient(135deg,#fffdf9,#fff5fb)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="dancing-script text-3xl text-purple-700">
                {groupId ? "Group Entry ✧" : "New Diary Entry ✧"}
              </h2>
              <p className="text-xs text-purple-400 mt-0.5 font-medium">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              {streak && streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200">
                  <Flame size={12} className="text-orange-500" />
                  <span className="text-xs font-black text-orange-600">{streak.currentStreak}</span>
                </div>
              )}
              <button onClick={closeForm} className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-pink-400 hover:text-pink-600 font-bold text-lg transition-colors">×</button>
            </div>
          </div>

          {/* Mood picker */}
          <div className="mt-3">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">Today's mood</p>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button key={m.label} type="button"
                  onClick={() => setMood(mood?.label === m.label ? null : m)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all ${mood?.label === m.label ? 'scale-110 shadow-md border-transparent text-white' : 'border-transparent bg-white/60 text-gray-600 hover:scale-105'}`}
                  style={mood?.label === m.label ? { background:m.color } : { background:'rgba(255,255,255,0.8)' }}>
                  <span>{m.emoji}</span> {m.display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Writing area */}
        <div className="flex-1 overflow-y-auto px-6 py-4"
          style={{ background:'#fffdf9', backgroundImage:'repeating-linear-gradient(transparent,transparent 27px,#e8d5c4 27px,#e8d5c4 28px)' }}>

          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title your memory…"
            maxLength={80}
            className="w-full bg-transparent border-none outline-none text-2xl font-bold text-purple-900 placeholder-purple-200 quicksand mb-4"
            style={{ fontFamily:"'Quicksand', sans-serif", lineHeight:'28px' }} />

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button type="button" onClick={() => insertText('**')}
              className="w-7 h-7 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-50 shadow-sm">
              <span className="text-xs font-black">B</span>
            </button>
            <button type="button" onClick={() => insertText('_')}
              className="w-7 h-7 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-50 shadow-sm">
              <span className="text-xs italic font-semibold">I</span>
            </button>
            <div className="w-px h-4 bg-purple-100 mx-0.5" />
            <div className="relative">
              <button type="button" onClick={() => setShowStickers(s => !s)}
                className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-white border border-purple-100 text-purple-600 hover:bg-purple-50 text-xs font-semibold shadow-sm">
                <Smile size={12} /> Stickers
              </button>
              {showStickers && (
                <div className="absolute top-9 left-0 z-20 bg-white rounded-2xl shadow-xl border border-purple-100 p-3 grid grid-cols-5 gap-1.5" style={{ minWidth:'180px' }}>
                  {STICKERS.map(s => (
                    <button key={s} type="button" onClick={() => { insertText(s+' '); setShowStickers(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-purple-50 text-lg">{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <textarea ref={textRef} value={entryText} onChange={e => { if (e.target.value.length > MAX) return; setEntryText(e.target.value); setCharCount(e.target.value.length); }}
            placeholder={"Dear diary...\n\nWrite your memory here, pour your heart out ♡"}
            className="w-full bg-transparent border-none outline-none resize-none text-gray-800 leading-7 text-base"
            style={{ fontFamily:"'Dancing Script', cursive", fontSize:'1.15rem', minHeight:'200px', lineHeight:'28px' }} />

          {/* Voice note */}
          <div className="mt-3 pt-3 border-t border-amber-100">
            <VoiceRecorder onRecorded={setVoiceData} />
          </div>

          {/* Secret / Lock options */}
          {!groupId && (
            <div className="mt-4 pt-3 border-t border-amber-100 space-y-2">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Privacy</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setIsSecret(s => !s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${isSecret ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
                  <Lock size={11} /> Secret Entry
                </button>
                <button type="button" onClick={() => setBurnAfter(b => !b)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${burnAfter ? 'bg-red-500 text-white border-red-500' : 'bg-white border-red-200 text-red-500 hover:bg-red-50'}`}>
                  🔥 Burn after reading
                </button>
              </div>
              {isSecret && (
                <div className="flex items-center gap-2 mt-1">
                  <Lock size={12} className="text-purple-500" />
                  <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/,''))}
                    placeholder="4-digit PIN"
                    className="w-28 px-3 py-1.5 rounded-xl border-2 border-purple-200 text-sm text-center font-bold tracking-widest focus:border-purple-400 outline-none"
                  />
                  <span className="text-xs text-purple-400">PIN to unlock</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-amber-100 flex items-center justify-between gap-4"
          style={{ background:'linear-gradient(135deg,#fffdf9,#fff5fb)' }}>
          <div className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#ede9fe" strokeWidth="3" />
              <circle cx="18" cy="18" r="14" fill="none"
                stroke={pct > 90 ? '#f87171' : pct > 70 ? '#fbbf24' : '#c4b5fd'}
                strokeWidth="3" strokeDasharray={circumference}
                strokeDashoffset={circumference - (pct/100)*circumference}
                strokeLinecap="round" transform="rotate(-90 18 18)" />
              <text x="18" y="22" textAnchor="middle" fontSize="8" fill="#8b5cf6" fontWeight="700">
                {MAX - charCount}
              </text>
            </svg>
            <span className="text-xs text-purple-400 font-medium">{charCount}/{MAX}</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={closeForm}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-purple-500 bg-purple-50 hover:bg-purple-100 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={loading || showSuccess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-70"
              style={{ background: showSuccess ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              {showSuccess ? <><span>✓</span> Saved!</> : loading ? 'Saving…' : <><Save size={15}/> Save Entry</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
