import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  X, Send, Package, ChevronLeft, Users, Clock,
  Check, CheckCheck, Bell, UserPlus, Search,
  Lock, Unlock, Image as ImageIcon, MessageSquare,
  BookOpen, Mic,
} from "lucide-react";
import Navbar_Main from "../components/Navbar_main";
import { io } from "socket.io-client";
import api, { SOCKET_URL } from "../utils/auth";
import { useLocation } from "react-router-dom";
import MobileBottomNav from "../components/MobileBottomNav";

// ── Socket singleton ──────────────────────────────────────────────────────────
let _socket = null;
const getSocket = () => {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return _socket;
};
const socket = getSocket();

// ── Constants ─────────────────────────────────────────────────────────────────
// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (ts) => {
  const d     = new Date(ts);
  const today = new Date();
  const yest  = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const getCountdown = (sendDate) => {
  const diff = new Date(sendDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// Normalise a message from any source into consistent shape
const norm = (raw) => ({
  ...raw,
  _id:         raw._id,
  tempId:      raw.tempId,
  chatId:      raw.chatId || "",
  senderId:    String(raw.sender?._id ?? raw.sender ?? raw.senderId ?? ""),
  receiverId:  String(raw.receiver?._id ?? raw.receiver ?? raw.receiverId ?? ""),
  senderName:  raw.sender?.username ?? raw.senderName ?? "",
  text:        raw.text || "",
  timestamp:   raw.timestamp || new Date().toISOString(),
  messageType: raw.messageType || "text",
  capsuleData:  raw.capsuleData || null,
  memoryData:   raw.memoryData || raw.memoryPreview || null,
  memoryType:   raw.memoryType || null,
  read:         raw.read || false,
});

// ── Avatar component ──────────────────────────────────────────────────────────
function Avatar({ name, online, size = "md" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className="relative shrink-0">
      <div className={`${sz} rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm`}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
    </div>
  );
}

// ── Capsule Share Picker ──────────────────────────────────────────────────────
function CapsulePicker({ onSelect, onClose }) {
  const [capsules, setCapsules] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    api.get('/capsules/all-capsules')
      .then((r) => setCapsules(r.data.capsules || []))
      .catch(() => setCapsules([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = capsules.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute bottom-20 left-0 right-0 mx-2 z-50 rounded-2xl shadow-2xl border border-violet-100 overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <Package size={16} />
          <span className="font-bold text-sm">Share a Time Capsule</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search capsules…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-violet-50 border border-violet-100 focus:outline-none focus:ring-1 focus:ring-violet-300"
          />
        </div>
      </div>

      {/* Capsule list */}
      <div className="max-h-60 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-5">No capsules found</p>
        ) : (
          filtered.map((c) => {
            const locked   = c.lockUntilSend && new Date() < new Date(c.sendDate);
            const cdText   = getCountdown(c.sendDate);
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-violet-50 transition-colors group border border-transparent hover:border-violet-100"
              >
                {/* Cover image or placeholder */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-violet-100 bg-violet-50 flex items-center justify-center">
                  {c.coverImage ? (
                    <img src={c.coverImage} alt="" className={`w-full h-full object-cover ${locked ? "blur-sm" : ""}`} />
                  ) : (
                    <Package size={20} className="text-violet-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{c.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {locked ? (
                      <>
                        <Lock size={10} className="text-rose-400" />
                        <span className="text-[10px] text-rose-400 font-medium">
                          {cdText ? `Unlocks in ${cdText}` : "Locked"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Unlock size={10} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-medium">Open now</span>
                      </>
                    )}
                  </div>
                  {c.category && (
                    <span className="text-[10px] text-gray-400">{c.category}</span>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                    ${locked
                      ? "bg-rose-100 text-rose-400"
                      : "bg-violet-100 text-violet-500 group-hover:bg-violet-500 group-hover:text-white"
                    }`}>
                    {locked ? <Lock size={12} /> : <Send size={12} />}
                  </div>
                  <span className="text-[9px] text-gray-400 group-hover:text-violet-500">Share</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Capsule bubble in chat ────────────────────────────────────────────────────
function CapsuleBubble({ capsuleData, isMine }) {
  if (!capsuleData) return null;
  const locked  = capsuleData.lockUntilSend && new Date() < new Date(capsuleData.sendDate);
  const cdText  = getCountdown(capsuleData.sendDate);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-md max-w-[240px] border ${
      isMine ? "border-violet-200 bg-violet-50" : "border-indigo-100 bg-indigo-50"
    }`}>
      {/* Image */}
      <div className="relative h-24 bg-gradient-to-br from-violet-200 to-indigo-200 overflow-hidden">
        {capsuleData.coverImage ? (
          <img
            src={capsuleData.coverImage}
            alt={capsuleData.title}
            className={`w-full h-full object-cover ${locked ? "blur-md brightness-50" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-white/60" />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Lock size={22} className="text-white" />
            {cdText && <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full">{cdText}</span>}
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <Package size={9} className="text-violet-500" />
          <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wider">Capsule</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-bold text-gray-800 truncate">{capsuleData.title}</p>
        {capsuleData.category && (
          <p className="text-[10px] text-gray-400 mt-0.5">{capsuleData.category}</p>
        )}
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${locked ? "text-rose-500" : "text-emerald-600"}`}>
          {locked ? (
            <><Lock size={10} /> Unlocks {cdText ? `in ${cdText}` : "soon"}</>
          ) : (
            <><Unlock size={10} /> Open now!</>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Memory Share Picker ───────────────────────────────────────────────────────
function MemoryPicker({ onSelect, onClose }) {
  const [tab, setTab]         = useState("diary"); // diary | photo
  const [diaries, setDiaries] = useState([]);
  const [albums, setAlbums]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/diary-entries/all-diary'),
      api.get('/photo-memories/get-all-photo'),
    ]).then(([d, a]) => {
      setDiaries(d.data.data || []);
      setAlbums(a.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const items = tab === "diary" ? diaries : albums;

  return (
    <div className="absolute bottom-20 left-0 right-0 mx-2 z-50 rounded-2xl shadow-2xl border border-pink-100 overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span className="font-bold text-sm">Share a Memory</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-pink-100">
        <button onClick={() => setTab("diary")}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab==="diary" ? "bg-pink-50 text-pink-600 border-b-2 border-pink-400" : "text-gray-500"}`}>
          📓 Diary Entries
        </button>
        <button onClick={() => setTab("photo")}
          className={`flex-1 py-2 text-xs font-bold transition-colors ${tab==="photo" ? "bg-pink-50 text-pink-600 border-b-2 border-pink-400" : "text-gray-500"}`}>
          📸 Photo Albums
        </button>
      </div>
      <div className="max-h-52 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-5">No {tab === "diary" ? "diary entries" : "photo albums"} found</p>
        ) : items.map(item => (
          <button key={item._id} onClick={() => onSelect(item, tab)}
            className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100">
            {tab === "photo" && item.photos?.[0] ? (
              <img src={item.photos[0]} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 text-lg">
                {tab === "diary" ? "📓" : "📸"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
              {tab === "diary" && item.content && (
                <p className="text-[10px] text-gray-400 truncate">{item.content.slice(0, 50)}…</p>
              )}
              {tab === "photo" && (
                <p className="text-[10px] text-gray-400">{item.photos?.length || 0} photo{item.photos?.length !== 1 ? "s" : ""}</p>
              )}
            </div>
            <Send size={12} className="text-pink-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Memory bubble in chat ─────────────────────────────────────────────────────
function MemoryBubble({ memoryData, memoryType, isMine }) {
  if (!memoryData) return null;
  const isDiary = memoryType === "DiaryMemory";
  return (
    <div className={`rounded-2xl overflow-hidden shadow-md max-w-[240px] border ${
      isMine ? "border-pink-200 bg-pink-50" : "border-purple-100 bg-purple-50"
    }`}>
      {!isDiary && memoryData.photos?.[0] && (
        <img src={memoryData.photos[0]} alt="" className="w-full h-24 object-cover" />
      )}
      {isDiary && (
        <div className="h-16 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
          <span className="text-3xl">📓</span>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/70 text-purple-600">
            {isDiary ? "Diary" : "Album"}
          </span>
          {memoryData.voiceNote?.url && <Mic size={9} className="text-pink-500" />}
        </div>
        <p className="text-sm font-bold text-gray-800 truncate">{memoryData.title}</p>
        {isDiary && memoryData.content && (
          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{memoryData.content}</p>
        )}
        {!isDiary && (
          <p className="text-[10px] text-gray-400 mt-0.5">{memoryData.photos?.length || 0} photos</p>
        )}
      </div>
    </div>
  );
}


function MsgBubble({ msg, isMine, friendName }) {
  const isCapsule = msg.messageType === "capsule_share";
  const isMemory  = msg.messageType === "memory_share";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2 mb-1`}>
      {!isMine && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
          {friendName?.[0]?.toUpperCase()}
        </div>
      )}
      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[68%]`}>
        {isCapsule ? (
          <CapsuleBubble capsuleData={msg.capsuleData} isMine={isMine} />
        ) : isMemory ? (
          <MemoryBubble memoryData={msg.memoryData} memoryType={msg.memoryType} isMine={isMine} />
        ) : (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isMine
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-violet-50 rounded-bl-sm"
          }`}>
            {msg.text}
          </div>
        )}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-gray-400">{fmtTime(msg.timestamp)}</span>
          {isMine && (
            msg.read
              ? <CheckCheck size={11} className="text-violet-400" />
              : <Check size={11} className="text-gray-300" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const [me,             setMe]             = useState(null);
  const [loadingMe,      setLoadingMe]      = useState(true);
  const [friends,        setFriends]        = useState([]);
  const [pendingIn,      setPendingIn]      = useState([]);  // incoming requests
  const [pendingOut,     setPendingOut]     = useState([]);  // outgoing requests
  const [selected,       setSelected]       = useState(null);
  const [msgText,        setMsgText]        = useState("");
  const [onlineIds,      setOnlineIds]      = useState([]);
  const [typing,         setTyping]         = useState({});
  const [search,         setSearch]         = useState("");
  const [searchRes,      setSearchRes]      = useState([]);
  const [showNotif,      setShowNotif]      = useState(false);
  const [showPicker,     setShowPicker]     = useState(false);
  const [showMemoryPicker, setShowMemoryPicker] = useState(false);
  const [mobileChat,     setMobileChat]     = useState(false);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);

  const typingTimers = useRef({});
  const endRef       = useRef(null);
  const location     = useLocation();

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selected?.messages?.length]);

  // URL token (Google OAuth)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("token")) {
      params.delete("token");
      window.history.replaceState({}, "", location.pathname + (params.toString() ? `?${params}` : ""));
    }
  }, [location]);

  // ── Fetch current user ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/auth/profile')
      .then((r) => setMe({ ...r.data.user, _id: String(r.data.user._id) }))
      .catch((err) => {
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      })
      .finally(() => setLoadingMe(false));
  }, []);

  // ── Fetch friends + pending ─────────────────────────────────────────────
  const fetchFriendData = useCallback(() => {
    if (!me) return;
    api.get('/friends')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data.friends || []);
        setFriends(prev => {
          // Preserve existing messages when refreshing
          const prevMap = Object.fromEntries(prev.map(f => [f._id, f]));
          return list.map((f) => ({
            ...f, _id: String(f._id),
            messages:    prevMap[String(f._id)]?.messages    || [],
            unreadCount: prevMap[String(f._id)]?.unreadCount || 0,
            lastMessage: prevMap[String(f._id)]?.lastMessage || null,
          }));
        });
      }).catch(() => {}); // Never throw on network error

    api.get('/friends/pending')
      .then((r) => {
        setPendingIn((r.data.received || []).map((u) => ({ ...u, _id: String(u._id) })));
        setPendingOut((r.data.sent    || []).map((u) => ({ ...u, _id: String(u._id) })));
      }).catch(() => {});
  }, [me]);

  useEffect(() => { fetchFriendData(); }, [fetchFriendData]);

  // ── Re-register socket + re-fetch when tab becomes visible ───────────────
  useEffect(() => {
    if (!me) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        socket.emit("register", me._id); // re-register socket
        fetchFriendData();               // silently refresh friends list
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [me, fetchFriendData]);

  // ── Socket setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return;

    const register = () => socket.emit("register", me._id);
    register();
    socket.on("connect", register);
    socket.on("reconnect", register);

    // Re-register when tab becomes visible (browser may have suspended WS)
    const onVisible = () => {
      if (document.visibilityState === "visible") register();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Online presence
    socket.on("online_users", (ids) => setOnlineIds(ids.map(String)));

    // Incoming friend request
    socket.on("receive_friend_request", ({ fromUser }) => {
      if (!fromUser?._id) return;
      const fid = String(fromUser._id);
      setPendingIn((prev) => prev.some((r) => r._id === fid) ? prev : [
        ...prev,
        { _id: fid, username: fromUser.username, fullname: fromUser.fullname },
      ]);
      setShowNotif(true);
    });

    // My request was accepted
    socket.on("friend_request_accepted", ({ fromUser }) => {
      if (!fromUser?._id) return;
      const fid = String(fromUser._id);
      setFriends((prev) => prev.some((f) => f._id === fid) ? prev : [
        ...prev,
        { _id: fid, username: fromUser.username, fullname: fromUser.fullname, messages: [], unreadCount: 0, lastMessage: null },
      ]);
      setPendingOut((prev) => prev.filter((r) => r._id !== fid));
    });

    // I accepted someone (server confirms, add them to my list)
    socket.on("friend_added", ({ friend }) => {
      if (!friend?._id) return;
      const fid = String(friend._id);
      setFriends((prev) => prev.some((f) => f._id === fid) ? prev : [
        ...prev,
        { _id: fid, username: friend.username, fullname: friend.fullname, messages: [], unreadCount: 0, lastMessage: null },
      ]);
    });

    // My request was declined
    socket.on("friend_request_declined", ({ fromUser }) => {
      if (fromUser?._id) setPendingOut((prev) => prev.filter((r) => r._id !== String(fromUser._id)));
    });

    // Read receipts
    socket.on("messages_read", ({ chatId }) => {
      setFriends((prev) => prev.map((f) => {
        if (!chatId.includes(f._id)) return f;
        return { ...f, messages: (f.messages || []).map((m) => ({ ...m, read: true })) };
      }));
      setSelected((prev) => {
        if (!prev || !chatId.includes(prev._id)) return prev;
        return { ...prev, messages: (prev.messages || []).map((m) => ({ ...m, read: true })) };
      });
    });

    return () => {
      socket.off("connect", register);
      socket.off("reconnect", register);
      socket.off("online_users");
      socket.off("receive_friend_request");
      socket.off("friend_request_accepted");
      socket.off("friend_added");
      socket.off("friend_request_declined");
      socket.off("messages_read");
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [me]);

  // ── Incoming messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return;
    const handle = (raw) => {
      const msg         = norm(raw);
      const isFromMe    = msg.senderId === me._id;
      const otherUserId = isFromMe ? msg.receiverId : msg.senderId;
      const matchTemp   = (m) => (msg.tempId && m.tempId === msg.tempId) || (msg._id && m._id === msg._id);

      setFriends((prev) => prev.map((f) => {
        if (f._id !== otherUserId) return f;
        const msgs  = [...(f.messages || [])];
        const idx   = msgs.findIndex(matchTemp);
        if (idx !== -1) msgs[idx] = msg; else msgs.push(msg);
        const unread = !isFromMe && selected?._id !== f._id ? (f.unreadCount || 0) + 1 : 0;
        return { ...f, messages: msgs, lastMessage: msg, unreadCount: unread };
      }));

      setSelected((prev) => {
        if (!prev || prev._id !== otherUserId) return prev;
        const msgs = [...(prev.messages || [])];
        const idx  = msgs.findIndex(matchTemp);
        if (idx !== -1) msgs[idx] = msg; else msgs.push(msg);
        return { ...prev, messages: msgs };
      });
    };

    socket.on("receive_message", handle);
    return () => socket.off("receive_message", handle);
  }, [me, selected]);

  // ── Typing ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me || !selected || !msgText) return;
    const chatId = [me._id, selected._id].sort().join("_");
    const t = setTimeout(() => socket.emit("typing", { chatId, senderId: me._id }), 300);
    return () => clearTimeout(t);
  }, [msgText, selected, me]);

  useEffect(() => {
    if (!me) return;
    const handle = ({ chatId, senderId }) => {
      if (!selected) return;
      const activeChatId = [me._id, selected._id].sort().join("_");
      if (chatId !== activeChatId || senderId === me._id) return;
      setTyping((prev) => ({ ...prev, [senderId]: true }));
      clearTimeout(typingTimers.current[senderId]);
      typingTimers.current[senderId] = setTimeout(
        () => setTyping((prev) => ({ ...prev, [senderId]: false })),
        1500
      );
    };
    socket.on("typing", handle);
    return () => socket.off("typing", handle);
  }, [me, selected]);

  // ── User search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setSearchRes([]); return; }
    const t = setTimeout(() => {
      api.get('/users', { params: { q: search } })
        .then((r) => {
          const list = (Array.isArray(r.data) ? r.data : (r.data.users || []))
            .filter((u) => String(u._id) !== me?._id)
            .map((u) => ({ ...u, _id: String(u._id) }));
          setSearchRes(list);
        }).catch(() => setSearchRes([]));
    }, 300);
    return () => clearTimeout(t);
  }, [search, me]);

  // ── Select friend + load history ─────────────────────────────────────────
  const selectFriend = useCallback((friend) => {
    const fid = String(friend._id);
    setSelected({ ...friend, _id: fid, messages: friend.messages || [] });
    setMobileChat(true);
    setFriends((prev) => prev.map((f) => f._id === fid ? { ...f, unreadCount: 0 } : f));

    if (!(friend.messages?.length)) {
      setLoadingMsgs(true);
      const chatId = [me._id, fid].sort().join("_");
      api.get(`/messages/${chatId}`)
        .then((r) => {
          const msgs = (Array.isArray(r.data) ? r.data : []).map(norm);
          setFriends((prev) => prev.map((f) => f._id === fid ? { ...f, messages: msgs, unreadCount: 0 } : f));
          setSelected((prev) => prev?._id === fid ? { ...prev, messages: msgs } : prev);

          // Mark as read
          const chatId2 = [me._id, fid].sort().join("_");
          socket.emit("read_messages", { chatId: chatId2, readerId: me._id });
        })
        .catch(console.error)
        .finally(() => setLoadingMsgs(false));
    }
  }, [me]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const sendRequest = (target) => {
    const tid = String(target._id);
    if (friends.some((f) => f._id === tid) || pendingOut.some((p) => p._id === tid) || pendingIn.some((p) => p._id === tid)) return;
    // Emit via socket (persists + notifies if online)
    socket.emit("send_friend_request", { senderId: me._id, receiverId: tid });
    // Also REST so it persists even if something goes wrong with socket
    api.post('/friends/request', { receiverId: tid }).catch(console.error);
    setPendingOut((prev) => [...prev, { _id: tid, username: target.username }]);
    setSearch(""); setSearchRes([]);
  };

  const acceptRequest = (fromId) => {
    const fid = String(fromId);
    socket.emit("accept_friend_request", { fromId: fid, toId: me._id });
    api.post('/friends/accept', { fromId: fid })
      .then((r) => {
        const nf = r.data.newFriend;
        const existing = pendingIn.find((p) => p._id === fid);
        setFriends((prev) => prev.some((f) => f._id === fid) ? prev : [
          ...prev,
          { _id: fid, username: nf?.username || existing?.username, messages: [], unreadCount: 0, lastMessage: null },
        ]);
      }).catch(console.error);
    setPendingIn((prev) => prev.filter((r) => r._id !== fid));
    if (pendingIn.length <= 1) setShowNotif(false);
  };

  const declineRequest = (fromId) => {
    const fid = String(fromId);
    socket.emit("decline_friend_request", { fromId: fid, toId: me._id });
    api.post('/friends/decline', { fromId: fid }).catch(console.error);
    setPendingIn((prev) => prev.filter((r) => r._id !== fid));
    if (pendingIn.length <= 1) setShowNotif(false);
  };

  const sendMsg = () => {
    if (!msgText.trim() || !selected || !me) return;
    const chatId  = [me._id, selected._id].sort().join("_");
    const tempId  = crypto.randomUUID();
    const optimistic = norm({
      tempId, chatId,
      senderId: me._id, receiverId: selected._id,
      text: msgText, timestamp: new Date().toISOString(), messageType: "text",
    });
    setSelected((p)  => p ? { ...p, messages: [...(p.messages || []), optimistic] } : p);
    setFriends((prev) => prev.map((f) =>
      f._id === selected._id ? { ...f, messages: [...(f.messages || []), optimistic], lastMessage: optimistic } : f
    ));
    setMsgText("");
    socket.emit("send_message", { tempId, chatId, senderId: me._id, receiverId: selected._id, text: msgText, timestamp: optimistic.timestamp, messageType: "text" });
  };

  const shareCapsule = (capsule) => {
    if (!selected || !me) return;
    const chatId = [me._id, selected._id].sort().join("_");
    const tempId = crypto.randomUUID();
    const ts     = new Date().toISOString();
    const optimistic = norm({
      tempId, chatId,
      senderId: me._id, receiverId: selected._id,
      text: `Shared a capsule: ${capsule.title}`,
      capsuleId: capsule._id, capsuleData: capsule,
      timestamp: ts, messageType: "capsule_share",
    });
    setSelected((p)  => p ? { ...p, messages: [...(p.messages || []), optimistic] } : p);
    setFriends((prev) => prev.map((f) =>
      f._id === selected._id ? { ...f, messages: [...(f.messages || []), optimistic], lastMessage: optimistic } : f
    ));
    socket.emit("send_message", { tempId, chatId, senderId: me._id, receiverId: selected._id, text: optimistic.text, capsuleId: capsule._id, timestamp: ts, messageType: "capsule_share" });
    setShowPicker(false);
  };

  const shareMemory = (memory, tab) => {
    if (!selected || !me) return;
    const chatId      = [me._id, selected._id].sort().join("_");
    const tempId      = crypto.randomUUID();
    const ts          = new Date().toISOString();
    const mType       = tab === "diary" ? "DiaryMemory" : "PhotoAlbum";
    const optimistic  = norm({
      tempId, chatId,
      senderId: me._id, receiverId: selected._id,
      text: `Shared a memory: ${memory.title}`,
      memoryId: memory._id, memoryData: memory, memoryType: mType,
      timestamp: ts, messageType: "memory_share",
    });
    setSelected((p) => p ? { ...p, messages: [...(p.messages || []), optimistic] } : p);
    setFriends((prev) => prev.map((f) =>
      f._id === selected._id ? { ...f, messages: [...(f.messages || []), optimistic], lastMessage: optimistic } : f
    ));
    socket.emit("send_message", {
      tempId, chatId, senderId: me._id, receiverId: selected._id,
      text: optimistic.text, memoryId: memory._id, memoryType: mType,
      timestamp: ts, messageType: "memory_share",
    });
    setShowMemoryPicker(false);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

  // ── Group messages by date ───────────────────────────────────────────────
  const groupByDate = (msgs = []) => {
    const out = []; let lastD = null;
    for (const m of msgs) {
      const d = fmtDate(m.timestamp);
      if (d !== lastD) { out.push({ type: "date", label: d }); lastD = d; }
      out.push({ type: "msg", msg: m });
    }
    return out;
  };

  if (loadingMe) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
      <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const groups       = groupByDate(selected?.messages);
  const totalPending = pendingIn.length;

  return (
    <>
   
        <Navbar_Main />
        <MobileBottomNav />
      <div className="min-h-screen quicksand" style={{ background: "linear-gradient(135deg,#ede9fe 0%,#e0e7ff 50%,#dbeafe 100%)" }}>
        <div className="max-w-7xl mx-auto px-3 py-4">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="chewy text-3xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Users size={26} className="text-violet-500" />
              Friends & Messages
            </h1>
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative p-2.5 rounded-2xl bg-white shadow-sm border border-violet-100 hover:bg-violet-50 transition-all"
            >
              <Bell size={18} className="text-violet-600" />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalPending}
                </span>
              )}
            </button>
          </div>

          {/* ── Friend Requests panel ── */}
          {showNotif && (
            <div className="mb-4 bg-white rounded-2xl shadow-lg border border-violet-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
                <h3 className="text-sm font-bold text-violet-700 flex items-center gap-2">
                  <UserPlus size={15} />
                  Friend Requests {totalPending > 0 && `(${totalPending})`}
                </h3>
                <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              {totalPending === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No pending requests</p>
              ) : (
                <div className="divide-y divide-violet-50">
                  {pendingIn.map((r) => (
                    <div key={r._id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.username} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-gray-800">{r.username}</p>
                          {r.fullname && r.fullname !== r.username && (
                            <p className="text-xs text-gray-400">{r.fullname}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(r._id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold rounded-full hover:from-violet-600 hover:to-indigo-600 transition-all shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(r._id)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Main chat layout ── */}
          <div
            className="bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden"
            style={{ height: "calc(100vh - 200px)", minHeight: 520 }}
          >
            <div className="flex h-full">

              {/* ── LEFT SIDEBAR ── */}
              <div className={`flex flex-col w-full md:w-72 lg:w-80 shrink-0 border-r border-violet-50 bg-gradient-to-b from-violet-50/60 to-white ${mobileChat ? "hidden md:flex" : "flex"}`}>

                {/* Search */}
                <div className="p-3 border-b border-violet-50">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search or add friends…"
                      className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl bg-white border border-violet-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700 placeholder-gray-400"
                    />
                  </div>

                  {/* Search results */}
                  {searchRes.length > 0 && (
                    <div className="mt-2 bg-white border border-violet-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {searchRes.map((u) => {
                        const isFriend  = friends.some((f) => f._id === u._id);
                        const isSent    = pendingOut.some((p) => p._id === u._id);
                        const isPending = pendingIn.some((p) => p._id === u._id);
                        return (
                          <div
                            key={u._id}
                            onClick={() => !isFriend && !isSent && !isPending && sendRequest(u)}
                            className={`flex items-center justify-between px-3 py-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                              !isFriend && !isSent && !isPending ? "hover:bg-violet-50 cursor-pointer" : "opacity-70"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar name={u.username} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{u.fullname || u.username}</p>
                                <p className="text-xs text-gray-400">@{u.username}</p>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold shrink-0 ml-2 px-2 py-0.5 rounded-full ${
                              isFriend  ? "bg-emerald-100 text-emerald-600" :
                              isSent    ? "bg-amber-100  text-amber-600"    :
                              isPending ? "bg-blue-100   text-blue-600"     :
                              "bg-violet-100 text-violet-600"
                            }`}>
                              {isFriend ? "Friends" : isSent ? "Sent" : isPending ? "Incoming" : "+ Add"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Friends list */}
                <div className="flex-1 overflow-y-auto">
                  {friends.length === 0 && pendingOut.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-12">
                      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
                        <Users size={28} className="text-violet-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-500">No friends yet</p>
                      <p className="text-xs text-gray-400 mt-1">Search above to find people</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-0.5">
                      {/* Confirmed friends */}
                      {friends.map((f) => {
                        const isOnline = onlineIds.includes(f._id);
                        const isActive = selected?._id === f._id;
                        const last     = f.lastMessage;
                        return (
                          <button
                            key={f._id}
                            onClick={() => selectFriend(f)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                              isActive ? "bg-gradient-to-r from-violet-100 to-indigo-100 shadow-sm" : "hover:bg-violet-50"
                            }`}
                          >
                            <Avatar name={f.username} online={isOnline} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm truncate ${isActive ? "font-extrabold text-violet-700" : "font-bold text-gray-800"}`}>
                                  {f.username}
                                </span>
                                {last && <span className="text-[10px] text-gray-400 shrink-0 ml-1">{fmtTime(last.timestamp)}</span>}
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs text-gray-400 truncate max-w-[130px]">
                                  {last
                                    ? (last.messageType === "capsule_share" ? "📦 Shared a capsule" : last.messageType === "memory_share" ? "📓 Shared a memory" : last.text)
                                    : isOnline ? "● Online" : "Tap to chat"}
                                </p>
                                {(f.unreadCount || 0) > 0 && (
                                  <span className="ml-1 min-w-[18px] h-[18px] bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shrink-0">
                                    {f.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Pending outgoing */}
                      {pendingOut.length > 0 && (
                        <div className="mt-2 px-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-300 mb-1 px-2">Pending</p>
                          {pendingOut.map((r) => (
                            <div key={r._id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl opacity-50">
                              <Avatar name={r.username} size="md" />
                              <div>
                                <p className="text-sm font-bold text-gray-600">{r.username}</p>
                                <p className="text-xs text-gray-400 italic">Request sent…</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── CHAT PANE ── */}
              <div className={`flex-1 flex flex-col ${!mobileChat ? "hidden md:flex" : "flex"} min-w-0`}>
                {selected ? (
                  <>
                    {/* Chat header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-violet-50 bg-white/80 backdrop-blur-sm shrink-0 shadow-sm">
                      <button className="md:hidden p-1.5 rounded-xl hover:bg-violet-50 text-violet-600" onClick={() => setMobileChat(false)}>
                        <ChevronLeft size={18} />
                      </button>
                      <Avatar name={selected.username} online={onlineIds.includes(selected._id)} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-gray-800 truncate">{selected.username}</p>
                        <p className="text-xs text-gray-400">
                          {typing[selected._id]
                            ? <span className="text-violet-500 font-medium">typing…</span>
                            : onlineIds.includes(selected._id)
                              ? <span className="text-emerald-500">● Online</span>
                              : "Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
                      style={{ background: "linear-gradient(180deg, #faf8ff 0%, #f5f3ff 100%)" }}>
                      {loadingMsgs ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="w-7 h-7 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
                            <MessageSquare size={28} className="text-violet-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-500">Start the conversation!</p>
                          <p className="text-xs text-gray-400 mt-1">Say hi or share a time capsule ✨</p>
                        </div>
                      ) : (
                        groups.map((item, i) => {
                          if (item.type === "date") return (
                            <div key={`d-${i}`} className="flex items-center gap-3 py-4">
                              <div className="flex-1 h-px bg-violet-100" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 bg-violet-50 rounded-full py-0.5">
                                {item.label}
                              </span>
                              <div className="flex-1 h-px bg-violet-100" />
                            </div>
                          );
                          const { msg } = item;
                          const isMine  = msg.senderId === me._id;
                          return (
                            <MsgBubble
                              key={msg._id || msg.tempId || i}
                              msg={msg}
                              isMine={isMine}
                              friendName={selected.username}
                            />
                          );
                        })
                      )}

                      {/* Typing indicator */}
                      {typing[selected._id] && (
                        <div className="flex items-end gap-2 mt-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {selected.username?.[0]?.toUpperCase()}
                          </div>
                          <div className="bg-white border border-violet-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex gap-1 items-center">
                            {[0, 150, 300].map((d) => (
                              <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div ref={endRef} />
                    </div>

                    {/* Input bar */}
                    <div className="px-3 py-3 border-t border-violet-50 bg-white shrink-0 relative">
                      {showPicker && (
                        <CapsulePicker onSelect={shareCapsule} onClose={() => setShowPicker(false)} />
                      )}
                      {showMemoryPicker && (
                        <MemoryPicker onSelect={shareMemory} onClose={() => setShowMemoryPicker(false)} />
                      )}
                      <div className="flex items-center gap-2">
                        {/* Capsule share button */}
                        <button
                          onClick={() => { setShowPicker((v) => !v); setShowMemoryPicker(false); }}
                          title="Share a capsule"
                          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                            showPicker
                              ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-200"
                              : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-100"
                          }`}
                        >
                          <Package size={16} />
                          <span className="hidden sm:inline text-xs">Capsule</span>
                        </button>

                        {/* Memory share button */}
                        <button
                          onClick={() => { setShowMemoryPicker((v) => !v); setShowPicker(false); }}
                          title="Share a memory"
                          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                            showMemoryPicker
                              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200"
                              : "bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100"
                          }`}
                        >
                          <BookOpen size={16} />
                          <span className="hidden sm:inline text-xs">Memory</span>
                        </button>

                        {/* Message input */}
                        <input
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                          onKeyDown={onKey}
                          placeholder="Type a message…"
                          className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-violet-50 border border-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700 placeholder-gray-400"
                        />

                        {/* Send button */}
                        <button
                          onClick={sendMsg}
                          disabled={!msgText.trim()}
                          className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 disabled:opacity-30 text-white rounded-xl transition-all shadow-sm shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No friend selected */
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-5 shadow-sm">
                      <MessageSquare size={36} className="text-violet-400" />
                    </div>
                    <p className="text-xl font-extrabold text-gray-700 quicksand">Your messages</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs quicksand leading-relaxed">
                      Select a friend to start chatting, or share a time capsule directly in your conversation ✨
                    </p>
                    {friends.length === 0 && (
                      <p className="text-xs text-violet-400 mt-5 font-semibold">
                        Add a friend using the search bar on the left!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
