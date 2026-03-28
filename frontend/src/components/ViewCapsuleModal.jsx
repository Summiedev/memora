import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Lock, Unlock, Clock, Send, Trash2 } from 'lucide-react';

const formatFullDate = (ts) =>
  new Date(ts).toLocaleDateString([], {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setIsPast(true);
        setTimeLeft('');
        return;
      }
      setIsPast(false);
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      if (days > 0)        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0)  setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      else                 setTimeLeft(`${minutes}m ${seconds}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { timeLeft, isPast };
};

const ViewCapsuleModal = ({ isOpen, closeModal, capsuleId }) => {
  const [capsule, setCapsule]         = useState(null);
  const [comments, setComments]       = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading]         = useState(true);
  const [errorMsg, setErrorMsg]       = useState('');
  const [postingComment, setPosting]  = useState(false);

  const { timeLeft, isPast } = useCountdown(capsule?.sendDate);

  // Derived: is this capsule still locked?
  const isStillLocked = capsule?.lockUntilSend && !isPast;

  useEffect(() => {
    if (!isOpen || !capsuleId) return;
    const token = localStorage.getItem('token');
    if (!token) { setErrorMsg('Not authenticated.'); setLoading(false); return; }

    setLoading(true);
    setErrorMsg('');
    setCapsule(null);
    setComments([]);

    const fetchAll = async () => {
      try {
        const [capRes, comRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/capsules/${capsuleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/comments/${capsuleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCapsule(capRes.data.data);
        if (comRes.data.success) setComments(comRes.data.comments);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to load capsule.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isOpen, capsuleId]);

  const handleAddComment = async () => {
    if (!newCommentText.trim() || postingComment) return;
    const token = localStorage.getItem('token');
    setPosting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${capsuleId}`,
        { content: newCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Comment post failed:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,58,138,0.35)', backdropFilter: 'blur(8px)' }}>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-blue-100">

        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              <p className="text-sm text-blue-400 font-medium">Loading capsule…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMsg && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-base font-semibold text-red-500 mb-4">{errorMsg}</p>
            <button onClick={closeModal} className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600">
              Close
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !errorMsg && capsule && (
          <>
            {/* Cover image */}
            {capsule.coverImage && (
              <div className="relative h-44 shrink-0 overflow-hidden">
                <img
                  src={capsule.coverImage}
                  alt="Cover"
                  className={`w-full h-full object-cover ${isStillLocked ? 'blur-md brightness-50' : ''}`}
                />
                {isStillLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Lock size={36} className="text-white drop-shadow-lg" />
                    <p className="text-white font-bold text-sm drop-shadow">Still locked</p>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
              </div>
            )}

            {/* Header */}
            <div className={`px-6 pt-${capsule.coverImage ? '2' : '6'} pb-4 border-b border-blue-50 shrink-0`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold text-blue-800 truncate pr-8">
                    {capsule.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Lock status badge */}
                    {isStillLocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
                        <Lock size={10} /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold">
                        <Unlock size={10} /> Unlocked
                      </span>
                    )}
                    {/* Category */}
                    {capsule.category && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                        {capsule.category}
                      </span>
                    )}
                    {/* Capsule type */}
                    {capsule.capsuleType === 'shared' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium border border-purple-100">
                        Shared
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date info */}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Clock size={13} className="shrink-0" />
                {isStillLocked ? (
                  <span>
                    Unlocks on <strong className="text-gray-700">{formatFullDate(capsule.sendDate)}</strong>
                    {timeLeft && <span className="ml-2 text-rose-500 font-semibold">({timeLeft} remaining)</span>}
                  </span>
                ) : (
                  <span>
                    Unlocked on <strong className="text-gray-700">{formatFullDate(capsule.sendDate)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {isStillLocked ? (
                /* Locked state */
                <div className="flex flex-col items-center py-8 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border-2 border-rose-100">
                    <Lock size={28} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 text-base">This capsule is sealed</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Come back when it unlocks — <strong>{formatFullDate(capsule.sendDate)}</strong>
                    </p>
                    {timeLeft && (
                      <p className="text-lg font-bold text-rose-500 mt-3 tracking-tight">
                        ⏳ {timeLeft}
                      </p>
                    )}
                  </div>
                  <button onClick={closeModal} className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                    Got it
                  </button>
                </div>
              ) : (
                <>
                  {/* Message */}
                  {capsule.message && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{capsule.message}</p>
                    </div>
                  )}

                  {/* Emotion tags */}
                  {capsule.emotionTags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {capsule.emotionTags.map((em, idx) => (
                        <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-600 border border-pink-100 rounded-full text-xs font-medium">
                          {em.charAt(0).toUpperCase() + em.slice(1)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {capsule.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {capsule.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Shared with */}
                  {capsule.capsuleType === 'shared' && capsule.sharedWith?.length > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Shared with: </span>
                      {capsule.sharedWith.map((u, i) => (
                        <span key={u._id || u} className="text-blue-600 font-medium">
                          {u.username || `Friend ${i + 1}`}{i < capsule.sharedWith.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Comments ({comments.length})
                    </h3>

                    {/* Comment input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Leave a comment…"
                        className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder-gray-400"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newCommentText.trim() || postingComment}
                        className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"
                      >
                        <Send size={14} />
                      </button>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-4">No comments yet — be the first! ✨</p>
                      ) : (
                        comments.map((c) => {
                          let avatarSrc = null;
                          if (c.userId?.avatar?.data) {
                            try {
                              avatarSrc = `data:${c.userId.avatar.contentType};base64,${btoa(
                                new Uint8Array(c.userId.avatar.data.data).reduce((d, b) => d + String.fromCharCode(b), '')
                              )}`;
                            } catch {}
                          }
                          return (
                            <div key={c._id} className="flex items-start gap-3 bg-blue-50 rounded-2xl p-3 border border-blue-100">
                              {avatarSrc ? (
                                <img src={avatarSrc} alt={c.userId.username} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {c.userId?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-sm font-semibold text-blue-800">{c.userId?.username}</span>
                                  <span className="text-[10px] text-gray-400 shrink-0">
                                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewCapsuleModal;
