// // import { useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';
// // import { X } from "lucide-react";
// // const imageOptions = [
// //   'https://picsum.photos/id/20/3670/2462',
// //   'https://picsum.photos/id/28/367/267',
// //   'https://picsum.photos/id/25/5000/3333',
// //   'https://picsum.photos/id/25/5000/3333',
// // ];

// // const TimeCapsuleModal = ({ isOpen, closeModal,addCapsule }) => {
// //   console.log(addCapsule);
// //   const [selectedImage, setSelectedImage] = useState('');
// //   const [sendToOthers, setSendToOthers] = useState(false);
// //   const [recipientName, setRecipientName] = useState('');
// //   const [recipientEmail, setRecipientEmail] = useState('');
// //   const [recipientPhone, setRecipientPhone] = useState('');
// //   const [messageForRecipient, setMessageForRecipient] = useState('');
// //   const [title, setTitle] = useState('');
// //   const [message, setMessage] = useState('');
// //   const [files, setFiles] = useState([]);
// //   const [sendDate, setSendDate] = useState('');
// //   const [lockUntilSend, setLockUntilSend] = useState(false);
// //   const [sendMethod, setSendMethod] = useState('email');
// //   const [tags, setTags] = useState('');
// //   const [uploading, setUploading] = useState(false);
// //   const [uploadProgress, setUploadProgress] = useState(0);
// //   const [media, setMedia] = useState([]);

// //   const handleUpload = (e) => {
// //     const files = Array.from(e.target.files);
// //     setMedia((prev) => [...prev, ...files]);
// //   };


// //   const handleSubmit = async (e) => {
// //     e.preventDefault(); // Prevent default form submission

// //     // Basic validation
// //     if (!title || !message || !sendDate) {
// //       alert('Please fill in the required fields: Title, Message, and Send Date.');
// //       return;
// //     }

// //     if (sendToOthers) {
// //       if (!recipientName) {
// //         alert('Please enter the recipient\'s name.');
// //         return;
// //       }

// //       if (sendMethod === 'email' && !recipientEmail) {
// //         alert('Please enter a valid recipient email.');
// //         return;
// //       }

// //       if (sendMethod === 'sms' && !recipientPhone) {
// //         alert('Please enter a valid recipient phone number.');
// //         return;
// //       }
// //     }
// //     try {
    

// //       const token = localStorage.getItem('token'); // retrieve token from localStorage
 


// //       setUploading(true);

// //       // Get signed upload parameters from backend
// //       const { data: signatureData } = await axios.get("http://localhost:5000/api/cloudinary-signature/signature");

// //       const uploadedUrls = await Promise.all(
// //         media.map(async (file) => {
// //           const formData = new FormData();
// //           formData.append('file', file);
// //           formData.append('api_key', signatureData.apiKey);
// //           formData.append('timestamp', signatureData.timestamp);
// //           formData.append('signature', signatureData.signature);
// //           formData.append('folder', 'capsule_media');
// //           const res = await axios.post(
// //             `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
// //             formData
// //           );

// //           return res.data.secure_url;
// //         })
// //       );
// //      // formData.append('photos', uploadedUrls);
// //       //const token = localStorage.getItem('token');

// //       const response = await axios.post('http://localhost:5000/api/capsules/create-capsule', {

// //           title,
// //           message,
// //           sendToOthers,
// //           recipientName,
// //           recipientEmail,
// //           recipientPhone,
// //           messageForRecipient,
// //           sendDate,
// //           lockUntilSend,
// //           sendMethod,
// //           tags,
// //           media: uploadedUrls, // Include the uploaded photo URLs
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           },
// //         }
// //       );

  

// //       console.log('Successfully submitted on frontend:', response.data);
// //       addCapsule(response.data.data);
// //       closeModal();
// //     } catch (error) {
// //       console.error("Submission error:", error.response || error.message);
// //       alert('Failed to submit. Please try again.');
// //     }
// //     // console.log({
// //     //  tags
// //     //   title,
// //     //   message,
// //     //   files,
// //     //   sendToOthers,
// //     //   recipientName,
// //     //   recipientEmail,
// //     //   recipientPhone,
// //     //   messageForRecipient,
// //     //   sendDate,
// //     //   lockUntilSend,
// //     //   sendMethod,
// //     //   selectedImage, 
// //     // });
// //     //addCapsule(response.data); 
// //     closeModal();
// //   };

// //   return (
// //     isOpen && (
// //       <div className="fixed inset-0 backdrop-blur-sm bg-opacity-80 flex items-center justify-center">
// //         <div className="bg-[#9999fd] rounded-xl p-6 w-full max-w-3xl h-[80vh] overflow-y-auto shadow-xl text-white font-sans text-sm">
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-xl font-semibold">Create Your Time Capsule ⋆｡°✩</h2>
// //             <button
// //               type="button"
// //               onClick={closeModal}
// //               className="text-white hover:text-red-500"
// //             >
// //               <X />
// //             </button>
// //           </div>
// //           <form className="space-y-5 bg-[#1f1f21] p-4 rounded-xl shadow-lg text-sm">

// //             <div>
// //               <label className="block mb-1 text-white">Title ⁎⁍̴̛</label>
// //               <input
// //                 value={title}
// //                 onChange={(e) => setTitle(e.target.value)}
// //                 placeholder="Give it a sweet title..."
// //                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //               />
// //             </div>

// //             <div>
// //               <label className="block mb-1 text-white">Message｡･ω･｡</label>
// //               <textarea
// //                 value={message}
// //                 onChange={(e) => setMessage(e.target.value)}
// //                 placeholder="Write from the heart... ♡"
// //                 rows={4}
// //                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //               />
// //             </div>

// //             <div>
// //               <label className="block mb-1 text-white">Attach Files</label>
// //               <input
// //   type="file"
// //   multiple
// //   accept="image/*,video/*,audio/*"
// //   onChange={(e) => setFiles([...files, ...e.target.files])}
// //   className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
// // />
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <label className="text-white">Send to others? </label>
// //               <label className="relative inline-flex items-center cursor-pointer">
// //                 <input
// //                   type="checkbox"
// //                   checked={sendToOthers}
// //                   onChange={() => setSendToOthers(!sendToOthers)}
// //                   className="sr-only peer"
// //                 />
// //                 <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
// //                 <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-4" />
// //               </label>
// //             </div>

// //             {sendToOthers && (
// //               <div className="space-y-3 bg-[#29292b] p-3 rounded-md border border-gray-600">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                   <div>
// //                     <label className="block mb-1 text-white">Recipient Name </label>
// //                     <input
// //                       value={recipientName}
// //                       onChange={(e) => setRecipientName(e.target.value)}
// //                       placeholder="Who's getting this?"
// //                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //                     />
// //                   </div>
// //                   <div>
// //                     <label className="block mb-1 text-white">Send via ✧</label>
// //                     <div className="flex gap-2 mt-1">
// //                       <button
// //                         type="button"
// //                         className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'email'
// //                             ? 'bg-blue-500 text-white'
// //                             : 'bg-gray-700 text-gray-300'
// //                           }`}
// //                         onClick={() => setSendMethod('email')}
// //                       >
// //                         Email
// //                       </button>
// //                       <button
// //                         type="button"
// //                         className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'sms'
// //                             ? 'bg-blue-500 text-white'
// //                             : 'bg-gray-700 text-gray-300'
// //                           }`}
// //                         onClick={() => setSendMethod('sms')}
// //                       >
// //                         Phone
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {sendMethod === 'email' ? (
// //                   <div>
// //                     <label className="block mb-1 text-white">Recipient Email</label>
// //                     <input
// //                       type="email"
// //                       value={recipientEmail}
// //                       onChange={(e) => setRecipientEmail(e.target.value)}
// //                       placeholder="example@mail.com"
// //                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //                     />
// //                   </div>
// //                 ) : (
// //                   <div>
// //                     <label className="block mb-1 text-white">Recipient Phone?</label>
// //                     <input
// //                       value={recipientPhone}
// //                       onChange={(e) => setRecipientPhone(e.target.value)}
// //                       placeholder="123-456-7890"
// //                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //                     />
// //                   </div>
// //                 )}

// //                 <div>
// //                   <label className="block mb-1 text-white">Message for Recipient *: ･ﾟ</label>
// //                   <textarea
// //                     value={messageForRecipient}
// //                     onChange={(e) => setMessageForRecipient(e.target.value)}
// //                     placeholder="Send them a little magic..."
// //                     rows={3}
// //                     className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             <div>
// //               <label className="block mb-1 text-white">Schedule Delivery Date  ⋆｡˚</label>
// //               <input
// //                 type="datetime-local"
// //                 value={sendDate}
// //                 onChange={(e) => setSendDate(e.target.value)}
// //                 min={new Date().toISOString().slice(0, 16)} 
// //                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
// //               />
// //             </div>

// //             <div className="flex items-center gap-2 text-white">
// //               <input
// //                 type="checkbox"
// //                 checked={lockUntilSend}
// //                 onChange={() => setLockUntilSend(!lockUntilSend)}
// //               />
// //               <label className="text-sm">Lock until send date?</label>
// //             </div>

// //             <div>
// //               <label className="block mb-1 text-white">Tags (comma-separated) ✿</label>
// //               <input
// //                 type="text"
// //                 value={tags}
// //                 onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
// //                 placeholder="e.g., birthday, memories, sparkle"
// //                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
// //               />
// //             </div>

// //             <div>
// //               <label className="block mb-2 text-white font-medium">Select a Cover Image ˚₊☆</label>
// //               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
// //                 {imageOptions.map((img, idx) => (
// //                   <div
// //                     key={idx}
// //                     onClick={() => setSelectedImage(img)}
// //                     className={`border-2 rounded-md cursor-pointer p-1 ${selectedImage === img ? 'border-blue-500' : 'border-gray-600'
// //                       }`}
// //                   >
// //                     <img
// //                       src={img}
// //                       alt={`Option ${idx + 1}`}
// //                       className="w-full h-20 object-cover rounded"
// //                     />
// //                   </div>
// //                 ))}
// //               </div>
// //               {selectedImage && (
// //                 <p className="text-xs text-gray-400 mt-1">Selected: {selectedImage.split('/').pop()}</p>
// //               )}
// //             </div>

// //             <div className="flex justify-end gap-3 mt-4">
// //               <button
// //                 type="button"
// //                 onClick={closeModal}
// //                 className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 text-sm"
// //               >
// //                 Close ´• ω •`
// //               </button>
// //               <button
// //                 type="button"
// //                 onClick={handleSubmit}
// //                 className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
// //               >
// //                 Submit ☆彡
// //               </button>
// //             </div>
// //           </form>

// //         </div>
// //       </div>
// //     )
// //   );
// // };

// // export default TimeCapsuleModal;
// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { X } from "lucide-react";
// const imageOptions = [
//   'https://picsum.photos/id/20/3670/2462',
//   'https://picsum.photos/id/28/367/267',
//   'https://picsum.photos/id/25/5000/3333',
//   'https://picsum.photos/id/25/5000/3333',
// ];

// const TimeCapsuleModal = ({ isOpen, closeModal, addCapsule }) => {
//   console.log(addCapsule);
//   const [selectedImage, setSelectedImage] = useState('');
//   const [sendToOthers, setSendToOthers] = useState(false);
//   const [recipientName, setRecipientName] = useState('');
//   const [recipientEmail, setRecipientEmail] = useState('');
//   const [recipientPhone, setRecipientPhone] = useState('');
//   const [messageForRecipient, setMessageForRecipient] = useState('');
//   const [title, setTitle] = useState('');
//   const [message, setMessage] = useState('');
//   const [files, setFiles] = useState([]);
//   const [sendDate, setSendDate] = useState('');
//   const [lockUntilSend, setLockUntilSend] = useState(false);
//   const [sendMethod, setSendMethod] = useState('email');
//   const [tags, setTags] = useState([]);
//   const [category, setCategory] = useState('Personal');
//   const [permissionLevel, setPermissionLevel] = useState('viewer');
//   const [reminder, setReminder] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [media, setMedia] = useState([]);
//    const [capsuleType, setCapsuleType] = useState('private'); // 'private' | 'public' | 'shared'
//   // ▶️ FEATURE: permission controls for shared capsules
//   const [shareWithFriends, setShareWithFriends] = useState(false);
//   const [friendsList, setFriendsList] = useState([]); // fetch from your API

//   // ▶️ FEATURE: emotional tagging
//   const [emotionTags, setEmotionTags] = useState([]); // e.g. ["joy", "nostalgia"]

//   // ▶️ FEATURE: reminder toggle

//   const categoryOptions = ['Personal', 'Work', 'Memories', 'Milestones', 'Other'];
//     const minDateTime = new Date().toISOString().slice(0, 16);
//   const handleUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setMedia((prev) => [...prev, ...files]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!title || !message || !sendDate) {
//       alert('Please fill in required fields: Title, Message, and Send Date.');
//       return;
//     }

//     if (sendToOthers) {
//       if (!recipientName) {
//         alert('Please enter the recipient\'s name.');
//         return;
//       }
//       if (sendMethod === 'email' && !recipientEmail) {
//         alert('Please enter a valid recipient email.');
//         return;
//       }
//       if (sendMethod === 'sms' && !recipientPhone) {
//         alert('Please enter a valid recipient phone number.');
//         return;
//       }
//     }
   

//     try {
//       const token = localStorage.getItem('token');
//       setUploading(true);
//        const folderName = 'capsule_media';
// const { data: sig} = await axios.get(
//   `http://localhost:5000/api/cloudinary-signature/signature?folder=${folderName}`
// );
// console.log("🔑 Signature payload:", sig);
     
//     const uploadedUrls = await Promise.all(
//   media.map(async (file, idx) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("api_key",   sig.apiKey);
//     formData.append("timestamp", sig.timestamp);
//     formData.append("signature", sig.signature);
//     formData.append("folder",    sig.folder);

//     // DEBUG: log out every key/value so we can see exactly what’s going to Cloudinary
//     for (let pair of formData.entries()) {
//       console.log(`FormData[${idx}]`, pair[0], "=", pair[1]);
//     }

//     const res = await axios.post(
//       `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
//       formData
//     );
//     return res.data.secure_url;
//   })
//       );

//       const payload = {
//         title,
//         message,
//         category,
//         sendToOthers,
//         recipientName,
//         recipientEmail,
//         recipientPhone,
//         messageForRecipient,
//         permissionLevel,
//         sendDate,
//         reminder,
//         lockUntilSend,
//         sendMethod,
//         tags,
//         media: uploadedUrls,
//         coverImage: selectedImage,
//           capsuleType,             // 'private' or 'shared'
//   sharedWith: shareWithFriends ? selectedFriendIds : [],
//   emotionTags,
//       };

//       const response = await axios.post(
//         'http://localhost:5000/api/capsules/create-capsule',
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log('Successfully submitted:', response.data);
//       addCapsule(response.data.data);
//       closeModal();
//     } catch (error) {
//       console.error('Submission error:', error.response || error.message);
//       alert('Failed to submit. Please try again.');
//     }
//   };

//   return (
//     isOpen && (
//       <div className="fixed inset-0 backdrop-blur-sm bg-opacity-80 flex items-center justify-center">
//         <div className="bg-[#9999fd] rounded-xl p-6 w-full max-w-3xl h-[80vh] overflow-y-auto shadow-xl text-white font-sans text-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">Create Your Time Capsule ⋆｡°✩</h2>
//             <button onClick={closeModal} className="text-white hover:text-red-500">
//               <X />
//             </button>
//           </div>

//           <form className="space-y-5 bg-[#1f1f21] p-4 rounded-xl shadow-lg">
//               {/* ▶️ Capsule Type */}
//           <div>
//   <label className="block mb-1">Capsule Type</label>
//   <div className="flex gap-3">
//     {['private','shared'].map(type => (
//       <button
//         key={type}
//         type="button"
//         onClick={() => setCapsuleType(type)}
//         className={`px-3 py-1 rounded-md text-sm ${
//           capsuleType === type 
//             ? 'bg-blue-500 text-white' 
//             : 'bg-gray-700 text-gray-300'
//         }`}
//       >
//         {type.charAt(0).toUpperCase()+type.slice(1)}
//       </button>
//     ))}
//   </div>
// </div>
//           {/* ▶️ Share With Friends (only if shared) */}
//           {capsuleType === 'shared' && (
//   <div className="space-y-2">
//     <label className="block mb-1">Share with friends?</label>
//     <input
//       type="checkbox"
//       checked={shareWithFriends}
//       onChange={() => setShareWithFriends(!shareWithFriends)}
//     />
//     {shareWithFriends && (
//       <div>
//         {/* TODO: Replace this placeholder with a real multi-select of friendsList */}
//         <p className="text-sm">[Friends multi-select goes here]</p>
//       </div>
//     )}
//   </div>
// )}


//             {/* Title & Message */}
//             <div>
//               <label className="block mb-1">Title ⁎⁍̴̛</label>
//               <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Give it a sweet title..."
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Message｡･ω･｡</label>
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Write from the heart... ♡"
//                 rows={4}
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block mb-1">Category</label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               >
//                 {categoryOptions.map((opt) => (
//                   <option key={opt} value={opt}>{opt}</option>
//                 ))}
//               </select>
//             </div>
//             {/* ▶️ Emotional Tags */}
// <div>
//   <label className="block mb-1">Emotional Tags</label>
//   <div className="flex flex-wrap gap-2">
//     {['joy','sadness','love','nostalgia','regret','hope'].map(em => (
//       <button
//         key={em}
//         type="button"
//         onClick={() => {
//           if (emotionTags.includes(em)) {
//             setEmotionTags(prev => prev.filter(x => x !== em));
//           } else {
//             setEmotionTags(prev => [...prev, em]);
//           }
//         }}
//         className={`px-3 py-1 rounded-md text-sm ${
//           emotionTags.includes(em)
//             ? 'bg-pink-500 text-white'
//             : 'bg-gray-700 text-gray-300'
//         }`}
//       >
//         {em.charAt(0).toUpperCase() + em.slice(1)}
//       </button>
//     ))}
//   </div>
// </div>


//             {/* File Attach & Media */}
//             <div>
//               <label className="block mb-1">Attach Files</label>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*,video/*,audio/*"
//                 onChange={handleUpload}
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             {/* Tags */}
//             <div>
//               <label className="block mb-1">Tags (comma-separated) ✿</label>
//               <input
//                 type="text"
//                 value={tags.join(', ')}
//                 onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
//                 placeholder="e.g., birthday, memories, sparkle"
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             {/* Cover Image Selection */}
//             <div>
//               <label className="block mb-1">Select a Cover Image ˚₊☆</label>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {imageOptions.map((img, idx) => (
//                   <div
//                     key={idx}
//                     onClick={() => setSelectedImage(img)}
//                     className={`border-2 rounded-md cursor-pointer p-1 ${selectedImage === img ? 'border-blue-500' : 'border-gray-600'}`}
//                   >
//                     <img src={img} alt={`Option ${idx+1}`} className="w-full h-20 object-cover rounded" />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Delivery Scheduling */}
//             <div>
//               <label className="block mb-1">Schedule Delivery Date ⋆｡˚</label>
//               <input
//                 type="datetime-local"
//                 value={sendDate}
//                 onChange={(e) => setSendDate(e.target.value)}
//                 min={new Date().toISOString().slice(0,16)}
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             {/* Lock & Early Access Prevention */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={lockUntilSend}
//                 onChange={() => setLockUntilSend(!lockUntilSend)}
//               />
//               <label>Lock until send date?</label>
//             </div>

//             {/* Reminder Toggle */}
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={reminder}
//                 onChange={() => setReminder(!reminder)}
//               />
//               <label>Send reminder 24h before unlock</label>
//             </div>

//             {/* Sharing Controls */}
//             <div className="flex items-center gap-2">
//               <label>Send to others?</label>
//               <input
//                 type="checkbox"
//                 checked={sendToOthers}
//                 onChange={() => setSendToOthers(!sendToOthers)}
//               />
//             </div>

//             {sendToOthers && (
//               <div className="space-y-3 bg-[#29292b] p-3 rounded-md border border-gray-600">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1">Recipient Name</label>
//                     <input
//                       value={recipientName}
//                       onChange={(e) => setRecipientName(e.target.value)}
//                       placeholder="Who's getting this?"
//                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1">Permission Level</label>
//                     <select
//                       value={permissionLevel}
//                       onChange={(e) => setPermissionLevel(e.target.value)}
//                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//                     >
//                       <option value="viewer">Viewer</option>
//                       <option value="collaborator">Collaborator</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1">Send via ✧</label>
//                     <div className="flex gap-2 mt-1">
//                       <button
//                         type="button"
//                         className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'email'
//                             ? 'bg-blue-500 text-white'
//                             : 'bg-gray-700 text-gray-300'
//                           }`}
//                         onClick={() => setSendMethod('email')}
//                       >
//                         Email
//                       </button>
//                       <button
//                         type="button"
//                         className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'sms'
//                             ? 'bg-blue-500 text-white'
//                             : 'bg-gray-700 text-gray-300'
//                           }`}
//                         onClick={() => setSendMethod('sms')}
//                       >
//                         Phone
//                       </button>
//                     </div>
//                   </div>

//                   {sendMethod === 'email' ? (
//                     <div>
//                       <label className="block mb-1">Recipient Email</label>
//                       <input
//                         type="email"
//                         value={recipientEmail}
//                         onChange={(e) => setRecipientEmail(e.target.value)}
//                         placeholder="example@mail.com"
//                         className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//                       />
//                     </div>
//                   ) : (
//                     <div>
//                       <label className="block mb-1">Recipient Phone?</label>
//                       <input
//                         value={recipientPhone}
//                         onChange={(e) => setRecipientPhone(e.target.value)}
//                         placeholder="123-456-7890"
//                         className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//                       />
//                     </div>
//                   )}

//                 </div>

//                 <div>
//                   <label className="block mb-1">Message for Recipient *: ･ﾟ</label>
//                   <textarea
//                     value={messageForRecipient}
//                     onChange={(e) => setMessageForRecipient(e.target.value)}
//                     placeholder="Send them a little magic..."
//                     rows={3}
//                     className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Form Actions */}
//             <div className="flex justify-end gap-3 mt-4">
//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 text-sm"
//               >
//                 Close ´• ω •`
//               </button>
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
//               >
//                 Submit ☆彡
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     )
//   );
// };
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Lock, Bell, Users, Tag, ImageIcon, ChevronRight, ChevronLeft, Check, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── colour palette for emotion tags ──────────────────────────────────
const EMOTIONS = [
  { id:'joy',       label:'Joy',       emoji:'😊', bg:'bg-yellow-100', active:'bg-yellow-400', text:'text-yellow-700' },
  { id:'love',      label:'Love',      emoji:'💕', bg:'bg-pink-100',   active:'bg-pink-400',   text:'text-pink-700'   },
  { id:'nostalgia', label:'Nostalgic', emoji:'🌅', bg:'bg-orange-100', active:'bg-orange-400', text:'text-orange-700' },
  { id:'hope',      label:'Hopeful',   emoji:'🌟', bg:'bg-blue-100',   active:'bg-blue-400',   text:'text-blue-700'   },
  { id:'sadness',   label:'Bittersweet',emoji:'🌧️',bg:'bg-indigo-100',active:'bg-indigo-400', text:'text-indigo-700' },
  { id:'gratitude', label:'Grateful',  emoji:'🙏', bg:'bg-teal-100',   active:'bg-teal-400',   text:'text-teal-700'   },
];

const CATEGORIES = ['Personal','Memories','Milestones','Work','Other'];

const COVER_IMAGES = [
  { url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', label:'Mountains' },
  { url:'https://images.unsplash.com/photo-1490750967868-88df5691cc27?w=400&q=80', label:'Flowers'   },
  { url:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', label:'Nature'    },
  { url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', label:'Portrait'  },
  { url:'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80', label:'Study'     },
  { url:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', label:'Friends'   },
];

// min datetime = right now (no past dates)
const getNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// ── shared input style ─────────────────────────────────────────────
const inp = "w-full px-4 py-3 rounded-2xl bg-white border-2 border-purple-100 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 text-sm transition-all";

// ── Step pill ─────────────────────────────────────────────────────
const StepPill = ({ n, label, active, done }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
    ${active ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' :
      done   ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
    {done ? <Check size={11}/> : <span>{n}</span>}
    <span className="hidden sm:inline">{label}</span>
  </div>
);

// ── Toggle switch ─────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, sub, icon }) => (
  <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border-2 border-purple-100 cursor-pointer hover:bg-purple-100 transition-all group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-500" style={{ background:'linear-gradient(135deg,#fdf4ff,#ede9ff)' }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-purple-800">{label}</p>
        {sub && <p className="text-xs text-purple-400">{sub}</p>}
      </div>
    </div>
    <div className="relative flex-shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-10 h-5 rounded-full bg-purple-200 peer-checked:bg-pink-400 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
    </div>
  </label>
);

// ─────────────────────────────────────────────────────────────────────
const TimeCapsuleModal = ({ isOpen, closeModal, addCapsule }) => {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // basics
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Personal');
  const [emotions, setEmotions] = useState([]);
  const [tags, setTags]         = useState([]);
  const [tagInput, setTagInput] = useState('');

  // media
  const [coverImage, setCoverImage]       = useState('');
  const [customCover, setCustomCover]     = useState(null);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [mediaFiles, setMediaFiles]       = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // schedule
  const [sendDate, setSendDate]       = useState('');
  const [lockUntilSend, setLock]      = useState(false);
  const [reminder, setReminder]       = useState(false);
  const [dateError, setDateError]     = useState('');

  // sharing
  const [capsuleType, setCapsuleType] = useState('private');
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // ui
  const [uploading, setUploading]   = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const [errors, setErrors]         = useState({});
  const fileRef = useRef();
  const coverRef = useRef();

  const minDate = getNow();

  // fetch friends
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://localhost:5000/api/friends', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setFriendsList(Array.isArray(r.data) ? r.data : r.data.friends || []))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // ── validation ────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!title.trim()) e.title = 'Give your capsule a title ✦';
      if (!message.trim()) e.message = 'Write something heartfelt ♡';
    }
    if (step === 3) {
      if (!sendDate) { e.date = 'Please pick an unlock date'; }
      else if (new Date(sendDate) <= new Date()) { e.date = 'Date must be in the future! ⏳'; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

  // ── tag helpers ───────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().replace(/,/g, '');
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(p => p.filter(x => x !== t));
  const onTagKey = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } };

  // ── media helpers ─────────────────────────────────────────────────
  const addMedia = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(p => [...p, ...files]);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      setMediaPreviews(p => [...p, { url, name: f.name }]);
    });
  };
  const removeMedia = (i) => {
    setMediaFiles(p => p.filter((_, idx) => idx !== i));
    setMediaPreviews(p => p.filter((_, idx) => idx !== i));
  };
  const addCustomCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCustomCover(f);
    const url = URL.createObjectURL(f);
    setCustomCoverUrl(url);
    setCoverImage('__custom__');
  };

  // ── submit ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const { data: sig } = await axios.get('http://localhost:5000/api/cloudinary-signature/signature?folder=capsule_media');

      const uploadFile = async (file, idx, total) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', sig.timestamp);
        fd.append('signature', sig.signature);
        fd.append('folder', sig.folder);
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, fd, {
          onUploadProgress: ev => setUploadPct(Math.round(((idx + ev.loaded / ev.total) / total) * 100))
        });
        return res.data.secure_url;
      };

      const allFiles = coverImage === '__custom__' && customCover ? [customCover, ...mediaFiles] : mediaFiles;
      const urls = await Promise.all(allFiles.map((f, i) => uploadFile(f, i, allFiles.length)));

      const finalCover = coverImage === '__custom__' ? urls.shift() : coverImage;
      const mediaUrls  = urls;

      const payload = {
        title, message, category, tags, sendDate,
        lockUntilSend, reminder,
        coverImage: finalCover,
        media: mediaUrls,
        capsuleType,
        sharedWith: capsuleType === 'shared' ? selectedFriends : [],
        emotionTags: emotions,
      };

      const res = await axios.post('http://localhost:5000/api/capsules/create-capsule', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addCapsule && addCapsule(res.data.data);
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to create capsule. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const stepLabels = ['Basics', 'Media', 'Schedule', 'Share'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background:'rgba(109,40,217,0.18)', backdropFilter:'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>

      <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── rainbow strip ── */}
        <div className="h-1.5 flex-shrink-0" style={{ background:'linear-gradient(90deg,#f9a8d4,#c4b5fd,#93c5fd,#6ee7b7)' }} />

        {/* ── header ── */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-purple-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="chewy text-2xl text-purple-800">New Time Capsule ✨</h2>
              <p className="text-xs text-purple-400 mt-0.5">Seal a moment in time, forever ♡</p>
            </div>
            <button onClick={closeModal} className="w-8 h-8 rounded-full bg-purple-50 hover:bg-pink-50 flex items-center justify-center text-purple-400 hover:text-pink-500 font-bold text-lg transition-colors flex-shrink-0">×</button>
          </div>
          {/* step pills */}
          <div className="flex gap-1.5 flex-wrap">
            {stepLabels.map((l, i) => (
              <StepPill key={i} n={i+1} label={l} active={step === i+1} done={step > i+1} />
            ))}
          </div>
        </div>

        {/* ── body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

              {/* ── STEP 1: Basics ────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Capsule Title ✦</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a sweet title..." className={inp} maxLength={80} />
                    {errors.title && <p className="text-pink-500 text-xs mt-1">⚠ {errors.title}</p>}
                    <p className="text-right text-xs text-purple-300 mt-1">{title.length}/80</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Your Message ♡</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write from the heart... what do you want to remember? What would you tell your future self?" rows={5}
                      className={inp + ' resize-none leading-relaxed'} maxLength={2000} />
                    {errors.message && <p className="text-pink-500 text-xs mt-1">⚠ {errors.message}</p>}
                    <p className="text-right text-xs text-purple-300 mt-1">{message.length}/2000</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c} type="button" onClick={() => setCategory(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${category === c ? 'border-purple-400 bg-purple-100 text-purple-700' : 'border-purple-100 bg-white text-purple-400 hover:border-purple-300'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emotions */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">How does this feel? 🎭</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOTIONS.map(em => {
                        const on = emotions.includes(em.id);
                        return (
                          <button key={em.id} type="button"
                            onClick={() => setEmotions(p => on ? p.filter(x=>x!==em.id) : [...p, em.id])}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${on ? `${em.active} border-transparent text-white shadow-md` : `${em.bg} border-transparent ${em.text} hover:opacity-80`}`}>
                            <span>{em.emoji}</span> {em.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Tags ✿</label>
                    <div className="flex gap-2">
                      <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey}
                        placeholder="Type a tag and press Enter..." className={inp + ' flex-1'} />
                      <button type="button" onClick={addTag}
                        className="px-4 py-2 rounded-2xl text-white text-sm font-bold flex-shrink-0 transition-all hover:scale-105"
                        style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>+</button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map(t => (
                          <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            #{t}
                            <button onClick={() => removeTag(t)} className="hover:text-pink-600 transition-colors">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Media ─────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Cover image */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">Cover Image 🖼️</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {COVER_IMAGES.map((img, i) => (
                        <button key={i} type="button" onClick={() => { setCoverImage(img.url); setCustomCover(null); setCustomCoverUrl(''); }}
                          className={`relative rounded-2xl overflow-hidden aspect-video border-2 transition-all ${coverImage === img.url ? 'border-pink-400 shadow-lg scale-[1.03]' : 'border-transparent hover:border-purple-200'}`}>
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          {coverImage === img.url && (
                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center"><Check size={14} className="text-pink-500" /></div>
                            </div>
                          )}
                          <p className="absolute bottom-0 inset-x-0 bg-black/30 text-white text-[9px] text-center py-0.5">{img.label}</p>
                        </button>
                      ))}
                    </div>
                    {/* custom cover upload */}
                    <button type="button" onClick={() => coverRef.current.click()}
                      className={`w-full py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all flex items-center justify-center gap-2 ${coverImage === '__custom__' ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-purple-200 text-purple-400 hover:border-purple-400 hover:bg-purple-50'}`}>
                      <ImageIcon size={16} />
                      {customCoverUrl ? 'Change custom cover' : 'Upload your own cover'}
                    </button>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={addCustomCover} />
                    {customCoverUrl && (
                      <div className="mt-2 relative rounded-2xl overflow-hidden h-28">
                        <img src={customCoverUrl} className="w-full h-full object-cover" alt="Custom cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <p className="absolute bottom-2 left-3 text-white text-xs font-semibold">Your cover ✓</p>
                      </div>
                    )}
                  </div>

                  {/* Media files */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">Attach Photos & Files 📎</label>
                    <button type="button" onClick={() => fileRef.current.click()}
                      className="w-full py-6 rounded-2xl border-2 border-dashed border-purple-200 text-purple-400 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500 transition-all flex flex-col items-center gap-2">
                      <Upload size={22} />
                      <span className="text-sm font-semibold">Click to upload images or videos</span>
                      <span className="text-xs opacity-70">PNG, JPG, MP4 up to 20MB each</span>
                    </button>
                    <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={addMedia} />
                    {mediaPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {mediaPreviews.map((p, i) => (
                          <div key={i} className="relative rounded-xl overflow-hidden aspect-square group">
                            <img src={p.url} className="w-full h-full object-cover" alt={p.name} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                            <button onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {mediaPreviews.length > 0 && <p className="text-xs text-purple-400 mt-1">{mediaPreviews.length} file(s) selected</p>}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Schedule ──────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 border-2 border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={18} className="text-purple-500" />
                      <label className="text-sm font-bold text-purple-700">Unlock Date & Time ⋆｡˚</label>
                    </div>
                    <p className="text-xs text-purple-400 mb-3">When should this capsule become available to open?</p>
                    <input type="datetime-local" value={sendDate}
                      onChange={e => { setSendDate(e.target.value); setDateError(''); }}
                      min={minDate}
                      className={inp + ' bg-white'}
                      style={{ colorScheme:'light' }} />
                    {errors.date && <p className="text-pink-500 text-xs mt-2 font-medium">⚠ {errors.date}</p>}
                    {sendDate && new Date(sendDate) > new Date() && (
                      <div className="mt-3 flex items-center gap-2 text-emerald-600 text-xs font-semibold bg-emerald-50 px-3 py-2 rounded-xl">
                        <Check size={13} /> Unlocks {new Date(sendDate).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    )}
                  </div>

                  {/* Preset quick picks */}
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">Quick picks ⚡</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label:'1 week',   days:7   },
                        { label:'1 month',  days:30  },
                        { label:'6 months', days:180 },
                        { label:'1 year',   days:365 },
                        { label:'5 years',  days:1825},
                        { label:'10 years', days:3650},
                      ].map(({ label, days }) => {
                        const d = new Date(); d.setDate(d.getDate() + days);
                        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                        const val = d.toISOString().slice(0, 16);
                        return (
                          <button key={label} type="button" onClick={() => { setSendDate(val); setErrors(e => ({...e, date:''})); }}
                            className={`py-2 rounded-2xl text-xs font-bold border-2 transition-all ${sendDate === val ? 'border-purple-400 bg-purple-100 text-purple-700' : 'border-purple-100 bg-white text-purple-500 hover:border-purple-300 hover:bg-purple-50'}`}>
                            In {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Toggle checked={lockUntilSend} onChange={e => setLock(e.target.checked)}
                      label="Lock until unlock date 🔒" sub="Content hidden until the date arrives"
                      icon={<Lock size={15} />} />
                    <Toggle checked={reminder} onChange={e => setReminder(e.target.checked)}
                      label="Reminder 24h before 🔔" sub="Get notified the day before it unlocks"
                      icon={<Bell size={15} />} />
                  </div>
                </div>
              )}

              {/* ── STEP 4: Share ─────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">Capsule visibility 👁️</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id:'private', emoji:'🔒', title:'Private',  sub:'Only you can see it'       },
                        { id:'shared',  emoji:'💌', title:'Shared',   sub:'Invite specific friends'   },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setCapsuleType(opt.id)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${capsuleType === opt.id ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-purple-100 bg-white hover:border-purple-200'}`}>
                          <div className="text-2xl mb-1">{opt.emoji}</div>
                          <p className="font-bold text-sm text-purple-800">{opt.title}</p>
                          <p className="text-xs text-purple-400">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {capsuleType === 'shared' && (
                    <div>
                      <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider">
                        Choose friends to share with <span className="text-pink-400">({selectedFriends.length} selected)</span>
                      </label>
                      {friendsList.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-purple-50 text-center text-sm text-purple-400 border-2 border-dashed border-purple-100">
                          <p className="text-2xl mb-1">🥺</p>
                          <p>You don't have any friends added yet!</p>
                          <a href="/friends" className="text-purple-600 font-bold hover:text-pink-500 text-xs mt-1 inline-block">Go add some friends →</a>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {friendsList.map(f => {
                            const sel = selectedFriends.includes(f._id);
                            return (
                              <button key={f._id} type="button"
                                onClick={() => setSelectedFriends(p => sel ? p.filter(x=>x!==f._id) : [...p, f._id])}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${sel ? 'border-pink-300 bg-pink-50' : 'border-purple-100 bg-white hover:border-purple-200'}`}>
                                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow"
                                  style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                                  {f.username?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-purple-900 truncate">{f.fullname || f.username}</p>
                                  <p className="text-xs text-purple-400">@{f.username}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'border-pink-400 bg-pink-400' : 'border-purple-200'}`}>
                                  {sel && <Check size={11} className="text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* summary */}
                  <div className="rounded-2xl p-4 border-2 border-purple-100 bg-purple-50 space-y-2">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">✦ Capsule summary</p>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Title</span><span className="font-semibold truncate ml-4">{title || '—'}</span></div>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Category</span><span className="font-semibold">{category}</span></div>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Unlocks</span><span className="font-semibold">{sendDate ? new Date(sendDate).toLocaleDateString() : '—'}</span></div>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Locked</span><span className="font-semibold">{lockUntilSend ? 'Yes 🔒' : 'No'}</span></div>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Media</span><span className="font-semibold">{mediaPreviews.length} file(s)</span></div>
                    <div className="flex justify-between text-xs text-purple-700"><span className="text-purple-400">Visibility</span><span className="font-semibold capitalize">{capsuleType}</span></div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── upload progress ── */}
        {uploading && (
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width:`${uploadPct}%`, background:'linear-gradient(90deg,#ec4899,#8b5cf6)' }} />
              </div>
              <span className="text-xs font-bold text-purple-600 flex-shrink-0">{uploadPct}%</span>
            </div>
            <p className="text-xs text-purple-400 text-center">Sealing your memories… ✨</p>
          </div>
        )}

        {/* ── footer nav ── */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-purple-50 flex items-center justify-between gap-3">
          <button type="button" onClick={step === 1 ? closeModal : back}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-purple-500 bg-purple-50 hover:bg-purple-100 transition-colors">
            <ChevronLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-1">
            {Array.from({length: TOTAL_STEPS}).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${step === i+1 ? 'w-6 bg-pink-400' : step > i+1 ? 'w-3 bg-emerald-400' : 'w-3 bg-purple-100'}`} />
            ))}
          </div>

          {step < TOTAL_STEPS ? (
            <button type="button" onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-60"
              style={{ background:'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
              <Sparkles size={15} /> {uploading ? 'Sealing…' : 'Seal Capsule ♡'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCapsuleModal;
