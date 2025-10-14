import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

/**
 * ViewCapsuleModal
 *
 * Props:
 *  - isOpen: boolean
 *  - closeModal: () => void
 *  - capsuleId: string  (MongoDB ObjectId of the capsule)
 */
const ViewCapsuleModal = ({ isOpen, closeModal, capsuleId }) => {
  const [capsule, setCapsule] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !capsuleId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Not authenticated.');
      setLoading(false);
      return;
    }

    const fetchCapsuleAndComments = async () => {
      try {
        // 1) Fetch capsule details (optional; for showing title/message)
        const capRes = await axios.get(
          `http://localhost:5000/api/capsules/${capsuleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(capRes.data);
        setCapsule(capRes.data.data);

        // 2) Fetch comments
        const comRes = await axios.get(
          `http://localhost:5000/api/comments/${capsuleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(comRes.data);
        if (comRes.data.success) {
          setComments(comRes.data.comments);
        } else {
          setErrorMsg('Failed to load comments.');
        }
      } catch (err) {
        console.error('Error fetching capsule or comments:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setErrorMsg(err.response.data.message);
        } else {
          setErrorMsg('An error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCapsuleAndComments();
  }, [isOpen, capsuleId]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('Not authenticated.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${capsuleId}`,
        { content: newCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        // Prepend new comment to state
        setComments(prev => [res.data.comment, ...prev]);
        setNewCommentText('');
      } else {
        setErrorMsg('Failed to post comment.');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Could not post comment.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-30">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] overflow-y-auto relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : errorMsg ? (
            <p className="text-red-500">{errorMsg}</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-blue-700 mb-1">
                {capsule.title}
              </h2>
              <p className="text-sm text-gray-500">
                Scheduled: {new Date(capsule.sendDate).toLocaleString()}
              </p>
            </>
          )}
        </div>

        {/* Capsule Body (locked check) */}
        {!loading && !errorMsg && (
          <>
            {/* If capsule is locked and lockUntilSend is true, show locked message */}
            {capsule.lockUntilSend && new Date() < new Date(capsule.sendDate) ? (
              <div className="p-6 text-center">
                <p className="text-xl font-semibold text-gray-700">
                  🔒 This capsule is still locked.
                </p>
                <p className="mt-2 text-gray-500">
                  It will unlock on:{' '}
                  <strong>{new Date(capsule.sendDate).toLocaleString()}</strong>
                </p>
                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Message */}
                {capsule.coverImage && (
                  <img
                    src={capsule.coverImage}
                    alt="Cover"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-800 whitespace-pre-wrap">
                  {capsule.message}
                </p>

                {/* Emotional Tags */}
                {capsule.emotionTags && capsule.emotionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {capsule.emotionTags.map((em, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-200 text-pink-800 px-2 py-1 rounded-full text-xs"
                      >
                        {em.charAt(0).toUpperCase() + em.slice(1)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Shared-With Info */}
                {capsule.capsuleType === 'shared' && capsule.sharedWith.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Shared with:&nbsp;
                    {capsule.sharedWith.map((uid, i) => (
                      <span key={uid} className="font-medium">
                        {`User#${i + 1}`}{/* You can replace with actual friend name if pre-populated */}{i < capsule.sharedWith.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                )}

                {/* ─────────── COMMENTS SECTION ─────────── */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Comments</h3>

                  {/* New Comment Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </div>

                  {/* Existing Comments */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500">No comments yet. Be the first!</p>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c._id}
                          className="border border-gray-200 p-3 rounded-md"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {c.userId.avatar && c.userId.avatar.data ? (
                              <img
  src={`data:${c.userId.avatar.contentType};base64,${btoa(
    new Uint8Array(c.userId.avatar.data.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  )}`}
                                alt={c.userId.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full" />
                            )}
                            <span className="font-medium text-gray-700">
                              {c.userId.username}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewCapsuleModal;
