import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { X } from 'lucide-react';

export default function CapsuleDetailsModal({ capsuleId, onClose }) {
  const [capsule, setCapsule] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // fetch capsule details (title, message, etc.)
  useEffect(() => {
    axios.get(`/api/capsules/${capsuleId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setCapsule(res.data.capsule))
      .catch(console.error);

    // fetch comments
    axios.get(`/api/comments/${capsuleId}/comments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setComments(res.data.data))
      .catch(console.error);
  }, [capsuleId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `/api/comments/${capsuleId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setComments(prev => [...prev, res.data.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!capsule) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: -20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{capsule.title}</h2>
          <p className="mb-4">{capsule.message}</p>
          {/* … any other capsule details … */}
          <hr className="my-4" />

          {/* Comments */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <div className="space-y-3 mb-4">
              {comments.map(c => (
                <div key={c._id} className="flex items-start space-x-3">
                  {c.userId.avatar ? (
                    <img src={c.userId.avatar} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                  <div>
                    <span className="font-medium">{c.userId.fullname || c.userId.username}</span>
                    <p className="text-sm">{c.content}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>

            {/* Add new comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={submitComment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
