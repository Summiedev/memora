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

// const TimeCapsuleModal = ({ isOpen, closeModal,addCapsule }) => {
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
//   const [tags, setTags] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [media, setMedia] = useState([]);

//   const handleUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setMedia((prev) => [...prev, ...files]);
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent default form submission

//     // Basic validation
//     if (!title || !message || !sendDate) {
//       alert('Please fill in the required fields: Title, Message, and Send Date.');
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
    

//       const token = localStorage.getItem('token'); // retrieve token from localStorage
 


//       setUploading(true);

//       // Get signed upload parameters from backend
//       const { data: signatureData } = await axios.get("http://localhost:5000/api/cloudinary-signature/signature");

//       const uploadedUrls = await Promise.all(
//         media.map(async (file) => {
//           const formData = new FormData();
//           formData.append('file', file);
//           formData.append('api_key', signatureData.apiKey);
//           formData.append('timestamp', signatureData.timestamp);
//           formData.append('signature', signatureData.signature);
//           formData.append('folder', 'capsule_media');
//           const res = await axios.post(
//             `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
//             formData
//           );

//           return res.data.secure_url;
//         })
//       );
//      // formData.append('photos', uploadedUrls);
//       //const token = localStorage.getItem('token');

//       const response = await axios.post('http://localhost:5000/api/capsules/create-capsule', {

//           title,
//           message,
//           sendToOthers,
//           recipientName,
//           recipientEmail,
//           recipientPhone,
//           messageForRecipient,
//           sendDate,
//           lockUntilSend,
//           sendMethod,
//           tags,
//           media: uploadedUrls, // Include the uploaded photo URLs
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

  

//       console.log('Successfully submitted on frontend:', response.data);
//       addCapsule(response.data.data);
//       closeModal();
//     } catch (error) {
//       console.error("Submission error:", error.response || error.message);
//       alert('Failed to submit. Please try again.');
//     }
//     // console.log({
//     //  tags
//     //   title,
//     //   message,
//     //   files,
//     //   sendToOthers,
//     //   recipientName,
//     //   recipientEmail,
//     //   recipientPhone,
//     //   messageForRecipient,
//     //   sendDate,
//     //   lockUntilSend,
//     //   sendMethod,
//     //   selectedImage, 
//     // });
//     //addCapsule(response.data); 
//     closeModal();
//   };

//   return (
//     isOpen && (
//       <div className="fixed inset-0 backdrop-blur-sm bg-opacity-80 flex items-center justify-center">
//         <div className="bg-[#9999fd] rounded-xl p-6 w-full max-w-3xl h-[80vh] overflow-y-auto shadow-xl text-white font-sans text-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">Create Your Time Capsule ⋆｡°✩</h2>
//             <button
//               type="button"
//               onClick={closeModal}
//               className="text-white hover:text-red-500"
//             >
//               <X />
//             </button>
//           </div>
//           <form className="space-y-5 bg-[#1f1f21] p-4 rounded-xl shadow-lg text-sm">

//             <div>
//               <label className="block mb-1 text-white">Title ⁎⁍̴̛</label>
//               <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Give it a sweet title..."
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-white">Message｡･ω･｡</label>
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Write from the heart... ♡"
//                 rows={4}
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//               />
//             </div>

//             <div>
//               <label className="block mb-1 text-white">Attach Files</label>
//               <input
//   type="file"
//   multiple
//   accept="image/*,video/*,audio/*"
//   onChange={(e) => setFiles([...files, ...e.target.files])}
//   className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
// />
//             </div>

//             <div className="flex items-center gap-2">
//               <label className="text-white">Send to others? </label>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={sendToOthers}
//                   onChange={() => setSendToOthers(!sendToOthers)}
//                   className="sr-only peer"
//                 />
//                 <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
//                 <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-4" />
//               </label>
//             </div>

//             {sendToOthers && (
//               <div className="space-y-3 bg-[#29292b] p-3 rounded-md border border-gray-600">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1 text-white">Recipient Name </label>
//                     <input
//                       value={recipientName}
//                       onChange={(e) => setRecipientName(e.target.value)}
//                       placeholder="Who's getting this?"
//                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-white">Send via ✧</label>
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
//                 </div>

//                 {sendMethod === 'email' ? (
//                   <div>
//                     <label className="block mb-1 text-white">Recipient Email</label>
//                     <input
//                       type="email"
//                       value={recipientEmail}
//                       onChange={(e) => setRecipientEmail(e.target.value)}
//                       placeholder="example@mail.com"
//                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//                     />
//                   </div>
//                 ) : (
//                   <div>
//                     <label className="block mb-1 text-white">Recipient Phone?</label>
//                     <input
//                       value={recipientPhone}
//                       onChange={(e) => setRecipientPhone(e.target.value)}
//                       placeholder="123-456-7890"
//                       className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//                     />
//                   </div>
//                 )}

//                 <div>
//                   <label className="block mb-1 text-white">Message for Recipient *: ･ﾟ</label>
//                   <textarea
//                     value={messageForRecipient}
//                     onChange={(e) => setMessageForRecipient(e.target.value)}
//                     placeholder="Send them a little magic..."
//                     rows={3}
//                     className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//                   />
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className="block mb-1 text-white">Schedule Delivery Date  ⋆｡˚</label>
//               <input
//                 type="datetime-local"
//                 value={sendDate}
//                 onChange={(e) => setSendDate(e.target.value)}
//                 min={new Date().toISOString().slice(0, 16)} 
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
//               />
//             </div>

//             <div className="flex items-center gap-2 text-white">
//               <input
//                 type="checkbox"
//                 checked={lockUntilSend}
//                 onChange={() => setLockUntilSend(!lockUntilSend)}
//               />
//               <label className="text-sm">Lock until send date?</label>
//             </div>

//             <div>
//               <label className="block mb-1 text-white">Tags (comma-separated) ✿</label>
//               <input
//                 type="text"
//                 value={tags}
//                 onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
//                 placeholder="e.g., birthday, memories, sparkle"
//                 className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600 placeholder:text-gray-400"
//               />
//             </div>

//             <div>
//               <label className="block mb-2 text-white font-medium">Select a Cover Image ˚₊☆</label>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {imageOptions.map((img, idx) => (
//                   <div
//                     key={idx}
//                     onClick={() => setSelectedImage(img)}
//                     className={`border-2 rounded-md cursor-pointer p-1 ${selectedImage === img ? 'border-blue-500' : 'border-gray-600'
//                       }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`Option ${idx + 1}`}
//                       className="w-full h-20 object-cover rounded"
//                     />
//                   </div>
//                 ))}
//               </div>
//               {selectedImage && (
//                 <p className="text-xs text-gray-400 mt-1">Selected: {selectedImage.split('/').pop()}</p>
//               )}
//             </div>

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

// export default TimeCapsuleModal;
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X } from "lucide-react";
const imageOptions = [
  'https://picsum.photos/id/20/3670/2462',
  'https://picsum.photos/id/28/367/267',
  'https://picsum.photos/id/25/5000/3333',
  'https://picsum.photos/id/25/5000/3333',
];

const TimeCapsuleModal = ({ isOpen, closeModal, addCapsule }) => {
  console.log(addCapsule);
  const [selectedImage, setSelectedImage] = useState('');
  const [sendToOthers, setSendToOthers] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [messageForRecipient, setMessageForRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [sendDate, setSendDate] = useState('');
  const [lockUntilSend, setLockUntilSend] = useState(false);
  const [sendMethod, setSendMethod] = useState('email');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('Personal');
  const [permissionLevel, setPermissionLevel] = useState('viewer');
  const [reminder, setReminder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [media, setMedia] = useState([]);

  const categoryOptions = ['Personal', 'Work', 'Memories', 'Milestones', 'Other'];
    const minDateTime = new Date().toISOString().slice(0, 16);
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    setMedia((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message || !sendDate) {
      alert('Please fill in required fields: Title, Message, and Send Date.');
      return;
    }

    if (sendToOthers) {
      if (!recipientName) {
        alert('Please enter the recipient\'s name.');
        return;
      }
      if (sendMethod === 'email' && !recipientEmail) {
        alert('Please enter a valid recipient email.');
        return;
      }
      if (sendMethod === 'sms' && !recipientPhone) {
        alert('Please enter a valid recipient phone number.');
        return;
      }
    }
   

    try {
      const token = localStorage.getItem('token');
      setUploading(true);
       const folderName = 'capsule_media';
const { data: sig} = await axios.get(
  `http://localhost:5000/api/cloudinary-signature/signature?folder=${folderName}`
);
console.log("🔑 Signature payload:", sig);
     
    const uploadedUrls = await Promise.all(
  media.map(async (file, idx) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key",   sig.apiKey);
    formData.append("timestamp", sig.timestamp);
    formData.append("signature", sig.signature);
    formData.append("folder",    sig.folder);

    // DEBUG: log out every key/value so we can see exactly what’s going to Cloudinary
    for (let pair of formData.entries()) {
      console.log(`FormData[${idx}]`, pair[0], "=", pair[1]);
    }

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      formData
    );
    return res.data.secure_url;
  })
      );

      const payload = {
        title,
        message,
        category,
        sendToOthers,
        recipientName,
        recipientEmail,
        recipientPhone,
        messageForRecipient,
        permissionLevel,
        sendDate,
        reminder,
        lockUntilSend,
        sendMethod,
        tags,
        media: uploadedUrls,
        coverImage: selectedImage,
      };

      const response = await axios.post(
        'http://localhost:5000/api/capsules/create-capsule',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Successfully submitted:', response.data);
      addCapsule(response.data.data);
      closeModal();
    } catch (error) {
      console.error('Submission error:', error.response || error.message);
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-80 flex items-center justify-center">
        <div className="bg-[#9999fd] rounded-xl p-6 w-full max-w-3xl h-[80vh] overflow-y-auto shadow-xl text-white font-sans text-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create Your Time Capsule ⋆｡°✩</h2>
            <button onClick={closeModal} className="text-white hover:text-red-500">
              <X />
            </button>
          </div>

          <form className="space-y-5 bg-[#1f1f21] p-4 rounded-xl shadow-lg">

            {/* Title & Message */}
            <div>
              <label className="block mb-1">Title ⁎⁍̴̛</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a sweet title..."
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              />
            </div>

            <div>
              <label className="block mb-1">Message｡･ω･｡</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write from the heart... ♡"
                rows={4}
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* File Attach & Media */}
            <div>
              <label className="block mb-1">Attach Files</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleUpload}
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block mb-1">Tags (comma-separated) ✿</label>
              <input
                type="text"
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
                placeholder="e.g., birthday, memories, sparkle"
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              />
            </div>

            {/* Cover Image Selection */}
            <div>
              <label className="block mb-1">Select a Cover Image ˚₊☆</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageOptions.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`border-2 rounded-md cursor-pointer p-1 ${selectedImage === img ? 'border-blue-500' : 'border-gray-600'}`}
                  >
                    <img src={img} alt={`Option ${idx+1}`} className="w-full h-20 object-cover rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Scheduling */}
            <div>
              <label className="block mb-1">Schedule Delivery Date ⋆｡˚</label>
              <input
                type="datetime-local"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                min={new Date().toISOString().slice(0,16)}
                className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
              />
            </div>

            {/* Lock & Early Access Prevention */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lockUntilSend}
                onChange={() => setLockUntilSend(!lockUntilSend)}
              />
              <label>Lock until send date?</label>
            </div>

            {/* Reminder Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reminder}
                onChange={() => setReminder(!reminder)}
              />
              <label>Send reminder 24h before unlock</label>
            </div>

            {/* Sharing Controls */}
            <div className="flex items-center gap-2">
              <label>Send to others?</label>
              <input
                type="checkbox"
                checked={sendToOthers}
                onChange={() => setSendToOthers(!sendToOthers)}
              />
            </div>

            {sendToOthers && (
              <div className="space-y-3 bg-[#29292b] p-3 rounded-md border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Recipient Name</label>
                    <input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Who's getting this?"
                      className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Permission Level</label>
                    <select
                      value={permissionLevel}
                      onChange={(e) => setPermissionLevel(e.target.value)}
                      className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="collaborator">Collaborator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Send via ✧</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'email'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                          }`}
                        onClick={() => setSendMethod('email')}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm ${sendMethod === 'sms'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                          }`}
                        onClick={() => setSendMethod('sms')}
                      >
                        Phone
                      </button>
                    </div>
                  </div>

                  {sendMethod === 'email' ? (
                    <div>
                      <label className="block mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-1">Recipient Phone?</label>
                      <input
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="123-456-7890"
                        className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
                      />
                    </div>
                  )}

                </div>

                <div>
                  <label className="block mb-1">Message for Recipient *: ･ﾟ</label>
                  <textarea
                    value={messageForRecipient}
                    onChange={(e) => setMessageForRecipient(e.target.value)}
                    placeholder="Send them a little magic..."
                    rows={3}
                    className="w-full p-2 rounded-md bg-[#2c2c2e] text-white border border-gray-600"
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 text-sm"
              >
                Close ´• ω •`
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Submit ☆彡
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default TimeCapsuleModal;
