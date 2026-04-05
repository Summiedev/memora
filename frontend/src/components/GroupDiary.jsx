import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from '../utils/auth';
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Lock, BookOpen, Send, X, Copy, Check, Mic, Play, Pause } from "lucide-react";

const GROUP_TYPES = [
  { key:'friends', emoji:'👯', label:'Friend Group' },
  { key:'couple',  emoji:'💑', label:'Couple' },
  { key:'school',  emoji:'🎓', label:'School Memories' },
  { key:'family',  emoji:'🏠', label:'Family' },
  { key:'custom',  emoji:'✨', label:'Custom' },
];

// ── Create Group Form ────────────────────────────────────────────────────────
function CreateGroupForm({ onClose, onCreate }) {
  const [name, setName]     = useState("");
  const [type, setType]     = useState("friends");
  const [emoji, setEmoji]   = useState("📖");
  const [desc, setDesc]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { alert("Give your group a name ✦"); return; }
    try {
      setLoading(true);
      const { data } = await api.post('/diary-entries/groups/create',
        { name, type, coverEmoji: emoji, description: desc });
      onCreate(data.data);
      onClose();
    } catch { alert("Failed to create group"); }
    finally { setLoading(false); }
  };

  return createPortal(
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', zIndex: 99999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y: 20 }} animate={{ scale:1, y: 0 }} exit={{ scale:0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ zIndex: 100000 }}
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="chewy text-xl text-purple-700">New Group Diary ✨</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold">×</button>
          </div>

          {/* Emoji + Name */}
          <div className="flex gap-2 mb-3">
            <input value={emoji} onChange={e=>setEmoji(e.target.value)} maxLength={2}
              className="w-14 text-center text-2xl border-2 border-purple-100 rounded-xl outline-none focus:border-purple-300" />
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Group name…"
              className="flex-1 px-3 py-2 border-2 border-purple-100 rounded-xl text-sm font-semibold outline-none focus:border-purple-300" />
          </div>

          {/* Type */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {GROUP_TYPES.map(t => (
              <button key={t.key} onClick={() => setType(t.key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${type===t.key ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
                <span className="text-lg">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>

          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What's this group about? (optional)"
            rows={2} className="w-full px-3 py-2 border-2 border-purple-100 rounded-xl text-sm outline-none focus:border-purple-300 resize-none mb-4" />

          <button onClick={handleCreate} disabled={loading}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md hover:scale-105 transition-all disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
            {loading ? 'Creating…' : '✨ Create Group Diary'}
          </button>
        </div>
      </motion.div>
    </motion.div>, document.body
  );
}

// ── Join Group Form ──────────────────────────────────────────────────────────
function JoinGroupForm({ onClose, onJoin }) {
  const [code, setCode]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 5) { alert("Enter a valid invite code"); return; }
    try {
      setLoading(true);
      const { data } = await api.post('/diary-entries/groups/join',
        { inviteCode: code.trim().toUpperCase() });
      onJoin(data.data);
      onClose();
    } catch { alert("Invalid invite code or group not found"); }
    finally { setLoading(false); }
  };

  return createPortal(
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', zIndex: 99999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y: 20 }} animate={{ scale:1, y: 0 }} exit={{ scale:0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
        style={{ zIndex: 100000 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="chewy text-xl text-purple-700">Join a Group 🤝</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">×</button>
        </div>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Invite code (e.g. AB12C)"
          className="w-full px-4 py-3 border-2 border-purple-100 rounded-2xl text-center text-lg font-bold tracking-widest outline-none focus:border-purple-300 mb-4" />
        <button onClick={handleJoin} disabled={loading}
          className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md hover:scale-105 transition-all disabled:opacity-60"
          style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
          {loading ? 'Joining…' : 'Join Group'}
        </button>
      </motion.div>
    </motion.div>, document.body
  );
}

// ── Group Viewer ─────────────────────────────────────────────────────────────
function GroupViewer({ group, onClose, me }) {
  const [entries, setEntries] = useState([]);
  const [title, setTitle]     = useState("");
  const [text, setText]       = useState("");
  const [mood, setMood]       = useState(null);
  const [posting, setPosting] = useState(false);
  const [copied, setCopied]   = useState(false);

  const MOODS = ['😊','😔','🥰','😤','🥺','🤩'];

  useEffect(() => {
    api.get(`/diary-entries/groups/${group._id}`)
      .then(r => setEntries(r.data.entries || [])).catch(() => {});
  }, [group._id]);

  const postEntry = async () => {
    if (!title.trim() || !text.trim()) return;
    try {
      setPosting(true);
      const { data } = await api.post(
        `/diary-entries/groups/${group._id}/entries`,
        { title, entryText: text, emotionTag: mood }
      );
      setEntries(e => [data.data, ...e]);
      setTitle(""); setText(""); setMood(null);
    } catch { alert("Failed to post entry"); }
    finally { setPosting(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group.inviteCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', zIndex: 99999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y: 20 }} animate={{ scale:1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight:'90vh', zIndex: 100000 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd)' }} />
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{group.coverEmoji || '📖'}</span>
            <div>
              <h2 className="font-black text-gray-800">{group.name}</h2>
              <p className="text-xs text-gray-400">{group.members?.length || 0} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {group.inviteCode && (
              <button onClick={copyCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-colors">
                {copied ? <Check size={12}/> : <Copy size={12}/>}
                {copied ? 'Copied!' : group.inviteCode}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">×</button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-sm font-semibold">No entries yet. Be the first!</p>
            </div>
          ) : entries.map(e => (
            <div key={e._id} className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-purple-800 text-sm">{e.title}</h3>
                <span className="text-[10px] text-purple-400 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">{e.content}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-700">
                  {e.createdBy?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-[10px] text-purple-500 font-semibold">{e.createdBy?.username || 'Someone'}</span>
                {e.emotionTag && <span className="text-xs">{e.emotionTag}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Write entry */}
        <div className="border-t border-gray-100 p-4 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Entry title…"
              className="flex-1 px-3 py-2 border-2 border-purple-100 rounded-xl text-sm font-semibold outline-none focus:border-purple-300" />
            <div className="flex gap-1">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(mood===m?null:m)}
                  className={`w-7 h-7 rounded-lg text-sm transition-all ${mood===m ? 'bg-purple-200 scale-110' : 'bg-gray-100 hover:bg-purple-50'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write your memory…"
              rows={2} className="flex-1 px-3 py-2 border-2 border-purple-100 rounded-xl text-sm outline-none focus:border-purple-300 resize-none" />
            <button onClick={postEntry} disabled={posting || !title.trim() || !text.trim()}
              className="px-4 rounded-xl text-white font-bold transition-all hover:scale-105 disabled:opacity-40"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>, document.body
  );
}

// ── Main GroupDiary Component ─────────────────────────────────────────────────
export default function GroupDiary({ me }) {
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]   = useState(false);
  const [viewing, setViewing]     = useState(null);

  const load = () => {
    api.get('/diary-entries/groups/mine')
      .then(r => setGroups(r.data.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="rounded-3xl border-2 border-pink-100 shadow-md bg-white/85 backdrop-blur p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-pink-500" />
          <h4 className="chewy text-lg text-pink-600">Group Diaries 👯</h4>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowJoin(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100">
            Join
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold hover:scale-105 transition-all"
            style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
            <Plus size={12} /> Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0,1].map(i=><div key={i} className="h-14 rounded-2xl bg-pink-50 animate-pulse"/>)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <div className="text-3xl mb-2">👯</div>
          <p className="text-xs font-semibold">No group diaries yet!</p>
          <p className="text-xs mt-0.5">Create one or join with a code</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(g => (
            <button key={g._id} onClick={() => setViewing(g)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl border-2 border-pink-100 bg-pink-50 hover:bg-pink-100 hover:border-pink-200 transition-all text-left">
              <span className="text-xl">{g.coverEmoji || '📖'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-pink-800 truncate">{g.name}</p>
                <p className="text-[10px] text-pink-500">{g.members?.length || 0} members</p>
              </div>
              <BookOpen size={13} className="text-pink-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateGroupForm onClose={() => setShowCreate(false)} onCreate={g => setGroups(prev => [g,...prev])} />}
        {showJoin   && <JoinGroupForm   onClose={() => setShowJoin(false)}   onJoin={g  => { setGroups(prev => [g,...prev]); load(); }} />}
        {viewing    && <GroupViewer group={viewing} onClose={() => setViewing(null)} me={me} />}
      </AnimatePresence>
    </div>
  );
}
