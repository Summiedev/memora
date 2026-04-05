import axios from 'axios';
import api from '../utils/auth';
// import React, { useEffect, useState } from 'react';
// import CapsuleCard from './CapsuleCard';
// import ViewCapsule from "./ViewCapsuleModal";

// import axios from 'axios';
// import Spinner from './Spinner';

//  const CapsuleList = ({ capsules, addCapsule, removeCapsule })  => {
//   //const [capsules, setCapsules] = useState([]);
//   const [selectedCapsule, setSelectedCapsule] = useState(null);
//    const [loading, setLoading] = useState(true);

//   const handleDetails = (capsule) => {
//     setSelectedCapsule(capsule);
//   };

//   const handleCloseView = () => {
//     setSelectedCapsule(null);
//   };
//     const [showModal, setShowModal] = useState(false);

//   const openModal = (capsule) => {
//     setSelectedCapsule(capsule);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedCapsule(null);
//   };
//   const token = localStorage.getItem('token'); 
//   console.log(capsules);
//   //useEffect(() => {
//    // fetchCapsules();
//   //}, []);

//   // const fetchCapsules = async () => {
//   //   const res = await api.get('/capsules/all-capsules',{
//   //       headers: {
//   //           Authorization: `Bearer ${token}`
//   //         }
//   //   }); // adjust your route
//   //   console.log('API response:', res.data); // 👈 log this
   
//   //   setCapsules(res.data.capsules);
//   //   console.log('Capsule image:', res.data.capsules[2].tags); // 👈 log this
//   // };

//   const handleDelete = async (id) => {
//     try {
//       const token = localStorage.getItem('token'); // or however you store it
  
//       await api.delete('/capsules/delete-capsule/${id}', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//   removeCapsule(id);
//    // fetchCapsules(); 
//     } catch (error) {
//       console.error('Delete failed:', error);
//     }
//   }

//   // const addCapsule = (newCapsule) => {
//   //   setCapsules((prevCapsules) => [newCapsule, ...prevCapsules]);
//   // };


//   const handleShare = async (id) => {
//     await api.post('/capsules/${id}/share');
//     alert('Capsule shared!');
//   };

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//          {capsules.length === 0 ? (
//     <p>No capsules available.</p>
//   ) : (
//     capsules.map((capsule) => (
//       <CapsuleCard
//         key={capsule._id}
//         image={capsule.coverImage}
//         title={capsule.title}
//         tags={capsule.tags}
//         unlockTime={capsule.sendDate}
//         sharedBy={capsule.sharedBy}
//         onManage={() => console.log('Manage:', capsule.tags)}
//         onDetails={() => handleDetails(capsule)}
//         onDelete={() => handleDelete(capsule._id)}
//         onShare={() => handleShare(capsule._id)}
//       />
//     ))
//   )}

//    {showModal && selectedCapsule && (
//         <ViewCapsule 
//           capsule={selectedCapsule} 
//           onClose={closeModal} 
//         />
//       )}

//     </div>
//   );
// };

// export default CapsuleList;
// src/components/CapsuleList.jsx

import React, { useState, useEffect } from "react";
import CapsuleCard from "./CapsuleCard";
// ▼ Remove the old “ViewCapsulePage” import; we’ll handle viewing in the parent.

import api from '../utils/auth';
import Spinner from "./Spinner";

const CapsuleList = ({ capsules, addCapsule, removeCapsule, onDetails }) => {

  const handleDelete = async (id) => {
    try {
      await api.delete(`/capsules/delete-capsule/${id}`);
      removeCapsule(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleShare = async (id) => {
    await api.post(`/capsules/${id}/share`, {});
    alert("Capsule shared!");
  };

  if (!capsules || capsules.length === 0) {
    return <p className="text-gray-500">No capsules available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {capsules.map((capsule) => (
        <CapsuleCard
          key={capsule._id}
          image={capsule.coverImage}
          title={capsule.title}
          tags={capsule.tags}
          unlockTime={capsule.sendDate}
          sharedBy={capsule.sharedBy}
          onManage={() => console.log("Manage:", capsule._id)}
          // ▼ Instead of managing state internally, call the parent’s onDetails:
          onDetails={() => onDetails(capsule)}
          onDelete={() => handleDelete(capsule._id)}
          onShare={() => handleShare(capsule._id)}
        />
      ))}


    </div>
  );
};

export default CapsuleList;
