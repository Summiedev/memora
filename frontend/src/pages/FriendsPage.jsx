import React, { useEffect, useState, useRef } from "react";
import { X, Send, Package, ChevronLeft, Users, Clock, Check, CheckCheck, Bell } from "lucide-react";
import Navbar_Main from "../components/Navbar_main";
import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:5000");

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const formatUnlockDate = (ts) =>
  new Date(ts).toLocaleDateString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

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

function CapsuleSharePicker({ onSelect, onClose, token }) {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/capsules/all-capsules", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setCapsules(r.data.capsules || []))
      .catch(() => setCapsules([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="absolute bottom-16 left-0 right-0 mx-2 z-50 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <span className="font-semibold text-sm flex items-center gap-2">
          <Package size={15} /> Share a Capsule
        </span>
        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-52 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <p className="text-center text-xs text-gray-400 py-4">Loading capsules…</p>
        ) : capsules.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">No capsules found.</p>
        ) : (
          capsules.map((c) => {
            const locked = c.lockUntilSend && new Date() < new Date(c.sendDate);
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                {c.coverImage ? (
                  <img src={c.coverImage} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-lg">
                    📦
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-blue-900 truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    {locked ? (
                      <><span className="text-rose-400">🔒</span> Locked · unlocks in {getCountdown(c.sendDate)}</>
                    ) : (
                      <><span className="text-emerald-500">🔓</span> Unlocked</>
                    )}
                  </p>
                </div>
                <span className="text-blue-400 opacity-0 group-hover:opacity-100 text-xs font-medium shrink-0">Share →</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function CapsuleBubble({ capsuleData, isMine }) {
  if (!capsuleData) return null;
  const locked = capsuleData.lockUntilSend && new Date() < new Date(capsuleData.sendDate);
  const countdown = getCountdown(capsuleData.sendDate);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-md border max-w-[220px] ${
      isMine ? "border-blue-300 bg-blue-50" : "border-purple-200 bg-purple-50"
    }`}>
      {capsuleData.coverImage && (
        <div className="relative">
          <img
            src={capsuleData.coverImage}
            className={`w-full h-24 object-cover ${locked ? "blur-sm brightness-75" : ""}`}
            alt={capsuleData.title}
          />
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
          )}
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-1">
          <Package size={12} className={isMine ? "text-blue-500" : "text-purple-500"} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Time Capsule</span>
        </div>
        <p className="text-sm font-bold text-gray-800 truncate">{capsuleData.title}</p>
        {locked ? (
          <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
            <Clock size={10} /> Unlocks in {countdown}
          </p>
        ) : (
          <p className="text-xs text-emerald-600 mt-1">🔓 Open now!</p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">
          {locked ? `Unlocks ${formatUnlockDate(capsuleData.sendDate)}` : `Unlocked ${formatUnlockDate(capsuleData.sendDate)}`}
        </p>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showCapsulePicker, setShowCapsulePicker] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const typingTimeouts = useRef({});
  const endOfMessagesRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedFriend?.messages?.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoadingUser(false);
        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id;
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ ...res.data.user, id: userId });
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    socket.emit("register", user.id);

    socket.on("online_users", (ids) => setOnlineUsers(ids));
    socket.on("receive_friend_request", ({ fromUser }) => {
      setShowNotif(true);
      setPendingReceived((prev) =>
        prev.some((r) => r._id === fromUser._id)
          ? prev
          : [...prev, { _id: fromUser._id, username: fromUser.username }]
      );
    });
    socket.on("friend_request_accepted", ({ fromUser }) => {
      setFriends((prev) =>
        prev.some((f) => f._id === fromUser._id)
          ? prev
          : [...prev, { ...fromUser, messages: [] }]
      );
      setPendingSent((prev) => prev.filter((r) => r._id !== fromUser._id));
    });
    socket.on("friend_request_declined", ({ fromUser }) => {
      setPendingSent((prev) => prev.filter((r) => r._id !== fromUser._id));
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_friend_request");
      socket.off("friend_request_accepted");
      socket.off("friend_request_declined");
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/friends", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data.friends || [];
        setFriends(list.map((f) => ({ ...f, messages: [] })));
      }).catch(() => {});
    axios.get("http://localhost:5000/api/friends/pending", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        setPendingReceived(r.data.received || []);
        setPendingSent(r.data.sent || []);
      }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedFriend || !user) return;
    const token = localStorage.getItem("token");
    const chatId = [user.id, selectedFriend._id].sort().join("_");
    axios.get(`http://localhost:5000/api/messages/${chatId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const msgs = Array.isArray(r.data) ? r.data : [];
        setFriends((prev) =>
          prev.map((f) => f._id === selectedFriend._id ? { ...f, messages: msgs, unreadCount: 0 } : f)
        );
        setSelectedFriend((prev) => (prev ? { ...prev, messages: msgs } : prev));
      }).catch(() => {});
  }, [selectedFriend?._id]);

  useEffect(() => {
    const handleIncomingMessage = (rawMsg) => {
      const msg = {
        ...rawMsg,
        chatId: rawMsg.chatId || [rawMsg.sender?._id ?? rawMsg.senderId, rawMsg.receiver?._id ?? rawMsg.receiverId].sort().join("_"),
        senderId: rawMsg.sender?._id ?? rawMsg.senderId,
        receiverId: rawMsg.receiver?._id ?? rawMsg.receiverId,
      };
      const isFromMe = String(msg.senderId) === String(user?.id);
      const otherUserId = isFromMe ? msg.receiverId : msg.senderId;
      const matchTemp = (m) => (msg.tempId && m.tempId === msg.tempId) || m._id === msg._id;

      setFriends((prev) =>
        prev.map((f) => {
          if (String(f._id) !== String(otherUserId)) return f;
          const updated = [...(f.messages || [])];
          const idx = updated.findIndex(matchTemp);
          if (idx !== -1) updated[idx] = msg; else updated.push(msg);
          return {
            ...f, messages: updated, lastMessage: msg,
            unreadCount: !isFromMe && selectedFriend?._id !== f._id ? (f.unreadCount || 0) + 1 : 0,
          };
        })
      );
      setSelectedFriend((prev) => {
        if (!prev || String(prev._id) !== String(otherUserId)) return prev;
        const updated = [...(prev.messages || [])];
        const idx = updated.findIndex(matchTemp);
        if (idx !== -1) updated[idx] = msg; else updated.push(msg);
        return { ...prev, messages: updated };
      });
    };
    socket.on("receive_message", handleIncomingMessage);
    return () => socket.off("receive_message", handleIncomingMessage);
  }, [selectedFriend, user]);

  useEffect(() => {
    if (!selectedFriend || !user) return;
    const typingTimeout = setTimeout(() => {
      if (!messageText) return;
      const chatId = [user.id, selectedFriend._id].sort().join("_");
      socket.emit("typing", { chatId, senderId: user.id });
    }, 300);
    return () => clearTimeout(typingTimeout);
  }, [messageText]);

  useEffect(() => {
    const handleTyping = ({ chatId, senderId }) => {
      const activeChatId = [user?.id, selectedFriend?._id].sort().join("_");
      if (chatId !== activeChatId || senderId === user?.id) return;
      setTypingStatus((prev) => ({ ...prev, [senderId]: true }));
      if (typingTimeouts.current[senderId]) clearTimeout(typingTimeouts.current[senderId]);
      typingTimeouts.current[senderId] = setTimeout(() => {
        setTypingStatus((prev) => ({ ...prev, [senderId]: false }));
        delete typingTimeouts.current[senderId];
      }, 1500);
    };
    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [selectedFriend, user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!search.trim()) return setUsers([]);
      axios.get(`http://localhost:5000/api/users?q=${encodeURIComponent(search)}`)
        .then((r) => { const list = Array.isArray(r.data) ? r.data : r.data.users || []; setUsers(list); })
        .catch(() => setUsers([]));
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleInvite = (target) => {
    if (!user) return;
    if (pendingReceived.some((r) => r._id === target._id) || pendingSent.some((r) => r._id === target._id) || friends.some((f) => f._id === target._id)) return;
    socket.emit("send_friend_request", { senderId: user.id, receiverId: target._id });
    setPendingSent((prev) => [...prev, { _id: target._id, username: target.username }]);
    setSearch(""); setUsers([]);
  };

  const handleAcceptInvite = (id) => {
    socket.emit("accept_friend_request", { fromId: id, toId: user.id });
    setFriends((prev) => [...prev, ...pendingReceived.filter((r) => r._id === id).map((f) => ({ ...f, messages: [] }))]);
    setPendingReceived((prev) => prev.filter((r) => r._id !== id));
    if (pendingReceived.length <= 1) setShowNotif(false);
  };

  const handleDeclineInvite = (id) => {
    socket.emit("decline_friend_request", { fromId: id, toId: user.id });
    setPendingReceived((prev) => prev.filter((r) => r._id !== id));
    if (pendingReceived.length <= 1) setShowNotif(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;
    const ts = new Date().toISOString();
    const chatId = [user.id, selectedFriend._id].sort().join("_");
    const tempId = crypto.randomUUID();
    const optimisticMsg = { tempId, chatId, senderId: user.id, receiverId: selectedFriend._id, text: messageText, timestamp: ts, messageType: "text" };
    setSelectedFriend((prev) => prev ? { ...prev, messages: [...(prev.messages || []), optimisticMsg] } : prev);
    setFriends((prev) => prev.map((f) => f._id === selectedFriend._id ? { ...f, messages: [...(f.messages || []), optimisticMsg], lastMessage: optimisticMsg } : f));
    setMessageText("");
    socket.emit("send_message", optimisticMsg);
  };

  const handleShareCapsule = (capsule) => {
    if (!selectedFriend) return;
    const ts = new Date().toISOString();
    const chatId = [user.id, selectedFriend._id].sort().join("_");
    const tempId = crypto.randomUUID();
    const msg = { tempId, chatId, senderId: user.id, receiverId: selectedFriend._id, text: `Shared a capsule: ${capsule.title}`, capsuleId: capsule._id, capsuleData: capsule, timestamp: ts, messageType: "capsule_share" };
    setSelectedFriend((prev) => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev);
    setFriends((prev) => prev.map((f) => f._id === selectedFriend._id ? { ...f, messages: [...(f.messages || []), msg], lastMessage: msg } : f));
    socket.emit("send_message", msg);
    setShowCapsulePicker(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    setMobileShowChat(true);
    setFriends((prev) => prev.map((f) => (f._id === friend._id ? { ...f, unreadCount: 0 } : f)));
  };

  if (loadingUser) return null;
  const token = localStorage.getItem("token");

  const groupMessagesByDate = (messages = []) => {
    const groups = [];
    let lastDate = null;
    for (const msg of messages) {
      const d = formatDate(msg.timestamp);
      if (d !== lastDate) { groups.push({ type: "date", label: d }); lastDate = d; }
      groups.push({ type: "msg", msg });
    }
    return groups;
  };

  const messageGroups = groupMessagesByDate(selectedFriend?.messages);
  const totalPending = pendingReceived.length;

  return (
    <>
      <Navbar_Main />
      <div className="min-h-screen font-quicksand" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #ede9fe 100%)" }}>
        <div className="max-w-7xl mx-auto px-3 py-5">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight flex items-center gap-2">
              <Users size={22} className="text-blue-500" /> Friends
            </h1>
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative p-2 rounded-full bg-white shadow-sm hover:bg-blue-50 transition-colors border border-blue-100"
            >
              <Bell size={18} className="text-blue-600" />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalPending}</span>
              )}
            </button>
          </div>

          {/* Pending dropdown */}
          {showNotif && totalPending > 0 && (
            <div className="mb-4 bg-white rounded-2xl shadow-lg border border-blue-100 p-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-3">Friend Requests ({totalPending})</h3>
              <div className="space-y-2">
                {pendingReceived.map((r) => (
                  <div key={r._id} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-blue-900">{r.username}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptInvite(r._id)} className="text-xs px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors">Accept</button>
                      <button onClick={() => handleDeclineInvite(r._id)} className="text-xs px-3 py-1 bg-rose-400 hover:bg-rose-500 text-white rounded-full font-medium transition-colors">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat layout */}
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>
            <div className="flex h-full">

              {/* Sidebar */}
              <div className={`flex flex-col border-r border-blue-50 bg-gradient-to-b from-blue-50 to-white ${mobileShowChat ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 shrink-0`}>
                <div className="p-4 border-b border-blue-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search or add friends…"
                      className="w-full pl-4 pr-4 py-2 text-sm rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder-gray-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {users.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white border border-blue-100 rounded-xl shadow-xl mt-1 max-h-44 overflow-y-auto">
                        {users.map((u) => (
                          <li key={u._id} className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3" onClick={() => handleInvite(u)}>
                            <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{u.username?.[0]?.toUpperCase()}</div>
                            <div>
                              <p className="text-sm font-semibold text-blue-800">{u.fullname}</p>
                              <p className="text-xs text-gray-400">@{u.username}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pb-8 text-center">
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-sm text-gray-400">No friends yet.</p>
                      <p className="text-xs text-gray-300">Search above to add some!</p>
                    </div>
                  ) : (
                    friends.map((friend) => {
                      const isOnline = onlineUsers.includes(friend._id);
                      const isActive = selectedFriend?._id === friend._id;
                      const lastMsg = friend.lastMessage;
                      return (
                        <button
                          key={friend._id}
                          onClick={() => selectFriend(friend)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${isActive ? "bg-blue-100 shadow-sm" : "hover:bg-blue-50"}`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-sm font-bold text-white shadow">
                              {friend.username?.[0]?.toUpperCase()}
                            </div>
                            {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-800 truncate">{friend.username}</span>
                              {lastMsg && <span className="text-[10px] text-gray-400 shrink-0 ml-1">{formatTime(lastMsg.timestamp)}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-gray-400 truncate max-w-[130px]">
                                {lastMsg ? (lastMsg.messageType === "capsule_share" ? "📦 Shared a capsule" : lastMsg.text) : (isOnline ? "Online" : "Offline")}
                              </p>
                              {(friend.unreadCount || 0) > 0 && (
                                <span className="ml-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">{friend.unreadCount}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}

                  {pendingSent.length > 0 && (
                    <div className="mt-3 px-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 mb-1 px-1">Pending</p>
                      {pendingSent.map((r) => (
                        <div key={r._id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl opacity-60">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">{r.username?.[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">{r.username}</p>
                            <p className="text-xs text-gray-400 italic">Request sent…</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Pane */}
              <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
                {selectedFriend ? (
                  <>
                    {/* Chat header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-50 bg-white shadow-sm shrink-0">
                      <button className="md:hidden p-1 rounded-lg hover:bg-blue-50 text-blue-600" onClick={() => setMobileShowChat(false)}>
                        <ChevronLeft size={18} />
                      </button>
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-sm font-bold text-white shadow">
                          {selectedFriend.username?.[0]?.toUpperCase()}
                        </div>
                        {onlineUsers.includes(selectedFriend._id) && <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{selectedFriend.username}</p>
                        <p className="text-xs text-gray-400">
                          {typingStatus[selectedFriend._id] ? "typing…" : onlineUsers.includes(selectedFriend._id) ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Messages area */}
                    <div
                      className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
                      style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 28px, #e0f2fe22 28px, #e0f2fe22 29px)" }}
                    >
                      {messageGroups.map((item, i) => {
                        if (item.type === "date") {
                          return (
                            <div key={`d-${i}`} className="flex items-center gap-3 py-3">
                              <div className="flex-1 h-px bg-blue-100" />
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2">{item.label}</span>
                              <div className="flex-1 h-px bg-blue-100" />
                            </div>
                          );
                        }

                        const msg = item.msg;
                        const senderIdStr = msg.senderId?.toString() || msg.sender?._id?.toString() || "";
                        const userIdStr = user?.id?.toString() || "";
                        const isMine = senderIdStr === userIdStr;
                        const isCapsule = msg.messageType === "capsule_share";

                        return (
                          <div key={msg._id || msg.tempId || i} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
                            {!isMine && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-[10px] font-bold text-white mr-2 mt-1 shrink-0">
                                {selectedFriend.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%]`}>
                              {isCapsule ? (
                                <CapsuleBubble capsuleData={msg.capsuleData} isMine={isMine} />
                              ) : (
                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMine ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-blue-50 rounded-bl-sm"}`}>
                                  {msg.text}
                                </div>
                              )}
                              <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                                <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                                {isMine && (msg.read ? <CheckCheck size={11} className="text-blue-400" /> : <Check size={11} className="text-gray-300" />)}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {typingStatus[selectedFriend._id] && (
                        <div className="flex items-end gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {selectedFriend.username?.[0]?.toUpperCase()}
                          </div>
                          <div className="bg-white border border-blue-50 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}

                      <div ref={endOfMessagesRef} />
                    </div>

                    {/* Input bar */}
                    <div className="px-3 py-3 border-t border-blue-50 bg-white shrink-0 relative">
                      {showCapsulePicker && (
                        <CapsuleSharePicker token={token} onSelect={handleShareCapsule} onClose={() => setShowCapsulePicker(false)} />
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowCapsulePicker((v) => !v)}
                          title="Share a capsule"
                          className={`p-2 rounded-xl transition-colors shrink-0 ${showCapsulePicker ? "bg-blue-500 text-white shadow" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}
                        >
                          <Package size={18} />
                        </button>
                        <input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message…"
                          className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder-gray-400"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                    <div className="text-6xl mb-4 select-none">💌</div>
                    <p className="text-lg font-semibold text-blue-700">Pick a friend to chat</p>
                    <p className="text-sm text-gray-400 mt-1">You can also share time capsules right in the conversation ✨</p>
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
