// pages/SharedWithMePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/auth';
import CapsuleCard from '../components/CapsuleCard';

export default function SharedWithMePage() {
  const [sharedCapsules, setSharedCapsules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await api.get('/users/me'
        );
        // assume res.data.user.sharedCapsules is an array of capsule IDs
        const capsuleIds = res.data.user.sharedCapsules || [];

        // bulk‐fetch capsule details
        const capsuleDetails = await Promise.all(
          capsuleIds.map(id =>
            api.get(`/capsules/${id}`)
          )
        );
        setSharedCapsules(capsuleDetails.map(r => r.data.data));
      } catch (err) {
        console.error('Failed to load shared capsules', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShared();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!sharedCapsules.length) {
    return <div className="p-4">No capsules have been shared with you yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sharedCapsules.map(c => (
        <CapsuleCard
          key={c._id}
          _id={c._id}
          title={c.title}
          coverImage={c.coverImage}
          sharedBy={c.sharedBy}
          sharedWith={c.sharedWith}
          onShareSuccess={() => {}}
          onUnshareSuccess={() => {
            // remove from local state so UI updates
            setSharedCapsules(prev => prev.filter(x => x._id !== c._id));
          }}
        />
      ))}
    </div>
  );
}
