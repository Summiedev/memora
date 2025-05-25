import React, { useState, useEffect } from 'react';
import MiniCapsule from './DashboardMiniCapsuleCard';
import axios from 'axios';

const DashboardMiniCarousel = () => {
  const [capsules, setCapsules] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/capsules/all-capsules', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sorted = res.data.capsules.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const latestFive = sorted.slice(0, 5);
      setCapsules(latestFive);
     
    } catch (err) {
      console.error('Error fetching capsules:', err);
    }
  };

  const getStatus = (capsule) => {
    if (capsule.status === 'Pending') {
      return '⏳ Pending'; 
    } else if (capsule.status === 'Sent') {
      return '📤 Sent';
    } else if (capsule.status === 'Locked') {
      return '🔒 Locked'; 
    } else {
      return '🔓 Unlocked'; 
    }
  };

  const truncate = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <>
      {/* Big Screens - Grid Layout */}
<div className="hidden lg:grid grid-cols-5 gap-6 mb-4">
  {capsules.map((capsule, index) => (
    
    <MiniCapsule
      key={capsule._id || index}
      title={capsule.title}
      date={new Date(capsule.createdAt).toLocaleDateString()}
      description={truncate(capsule.message)}
      tags={capsule.tags}
      status={getStatus(capsule)}
      onClick={() => setSelectedCapsule(capsule)}
    />
  ))}
</div>

{/* Small Screens - Scrollable Carousel */}
<div className="lg:hidden overflow-x-auto mb-4">
  <div className="flex gap-4 w-max px-1">
    {capsules.map((capsule, index) => (
      <MiniCapsule
        key={capsule._id || index}
        title={capsule.title}
        date={new Date(capsule.createdAt).toLocaleDateString()}
        description={truncate(capsule.message)}
        tags={capsule.tags}
        status={getStatus(capsule)}
        onClick={() => setSelectedCapsule(capsule)}
      />
    ))}
  </div>
</div>

    </>
  );
};

export default DashboardMiniCarousel;
