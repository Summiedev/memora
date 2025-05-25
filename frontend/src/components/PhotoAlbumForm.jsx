import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function PhotoAlbumForm({ closeForm, onCreate = () => {},   // default to no-op
  onUpdate = () => {}, }) {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || photos.length === 0)
      return alert("Title & photos are required");

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1) get signature
      const { data: signatureData } = await axios.get(
        "http://localhost:5000/api/cloudinary-signature/signature"
      );

      // 2) upload each file, track overall progress
      const uploadedUrls = await Promise.all(
        photos.map(async (file, idx) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", signatureData.apiKey);
          formData.append("timestamp", signatureData.timestamp);
          formData.append("signature", signatureData.signature);
          formData.append("folder", "album_images");

          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (event) => {
                const fileFraction = event.loaded / event.total;
                const overall =
                  Math.round(
                    ((idx + fileFraction) / photos.length) * 100
                  );
                setUploadProgress(overall);
              },
            }
          );

          // ensure each step at least bumps progress
          setUploadProgress(Math.round(((idx + 1) / photos.length) * 100));
          return res.data.secure_url;
        })
      );

      // 3) save to your backend
      const { data } = await axios.post(
        "http://localhost:5000/api/photo-memories/create-photo-album",
        {
          title,
          description: caption,
          photos: uploadedUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Memory saved!");
      const created = data.data;
   
      ;(onCreate || onUpdate)(created);

      alert("Memory saved!");
      closeForm();
    } catch (err) {
      console.error("Error uploading memory:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save memory. Check console/network for details."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-blue-200 p-6 rounded-2xl shadow-2xl border border-blue-400 h-full sm:h-[90%] md:h-[80%] md:w-[65%] text-white">
        <button
          onClick={closeForm}
          className="absolute top-3 right-3 text-white hover:text-pink-300"
          disabled={uploading}
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4">
          Add Photo Album ✧･ﾟ: *✧･ﾟ:*
        </h2>

        <form onSubmit={handleSave}>
          {uploading && (
  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[80%] z-50 pointer-events-none">
    <div className="w-full bg-gray-400 h-2 rounded">
      <div
        className="bg-blue-600 h-2 rounded transition-all duration-200"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <p className="text-center text-white text-sm mt-1">
      Uploading… {uploadProgress}%
    </p>
  </div>
)}

          <input
            type="text"
            placeholder="Album Title"
            className="mb-4 w-full bg-gray-700 rounded-md p-2 text-md font-semibold text-white placeholder:text-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="mb-4 w-full bg-gray-700 rounded-md p-2 text-sm"
            disabled={uploading}
          />
          <textarea
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-md text-white placeholder:text-gray-400 mb-2"
            disabled={uploading}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[url('/textures/paper.png')] h-60 overflow-y-auto p-3 rounded-lg">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Uploaded Preview"
                  className="rounded-xl border-2 border-blue-400 shadow-md object-cover h-24 w-full"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  disabled={uploading}
                >
                  &minus;
                </button>
              </div>
            ))}
          </div>

         

          <div className="flex justify-between mt-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
            >
              ✧・ﾟ Save・ﾟ✧
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={uploading}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
            >
              ✧・ﾟ Cancel ・ﾟ✧
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// // import { useEffect, useState } from "react";
// // import { X } from "lucide-react";
// // import axios from "axios";

// // export default function PhotoAlbumForm({ closeForm, onCreate, onUpdate, album }) {
// //   const isEditing = !!album;
// //   const [photos, setPhotos] = useState([]);
// //   const [existingPhotoUrls, setExistingPhotoUrls] = useState([]);
// //   const [caption, setCaption] = useState("");
// //   const [title, setTitle] = useState("");
// //   const [uploading, setUploading] = useState(false);

// //   useEffect(() => {
// //     if (isEditing) {
// //       setTitle(album.title || "");
// //       setCaption(album.description || "");
// //       setExistingPhotoUrls(album.photos || []);
// //     }
// //   }, [album]);

// //   const handleUpload = (e) => {
// //     const files = Array.from(e.target.files);
// //     setPhotos((prev) => [...prev, ...files]);
// //   };

// //   const handleSave = async (e) => {
// //     e.preventDefault();
// //     if (!title || (photos.length === 0 && existingPhotoUrls.length === 0)) {
// //       return alert("Title and at least one photo are required");
// //     }

// //     try {
// //       setUploading(true);

// //       let uploadedUrls = [];

// //       if (photos.length > 0) {
// //         const { data: signatureData } = await axios.get("http://localhost:5000/api/cloudinary-signature/signature");

// //         uploadedUrls = await Promise.all(
// //           photos.map(async (file) => {
// //             const formData = new FormData();
// //             formData.append("file", file);
// //             formData.append("api_key", signatureData.apiKey);
// //             formData.append("timestamp", signatureData.timestamp);
// //             formData.append("signature", signatureData.signature);
// //             formData.append("folder", "album_images");

// //             const res = await axios.post(
// //               `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
// //               formData
// //             );
// //             return res.data.secure_url;
// //           })
// //         );
// //       }

// //       const fullPhotoUrls = [...existingPhotoUrls, ...uploadedUrls];

// //       const payload = {
// //         title,
// //         description: caption,
// //         photos: fullPhotoUrls,
// //       };

// //       const config = {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem("token")}`,
// //         },
// //       };

// //       if (isEditing) {
// //         const { data } = await axios.patch(
// //           `http://localhost:5000/api/photo-memories/${album._id}`,
// //           payload,
// //           config
// //         );
// //         alert("Album updated!");
// //         onUpdate(data.data);
// //       } else {
// //         const { data } = await axios.post(
// //           "http://localhost:5000/api/photo-memories/create-photo-album",
// //           payload,
// //           config
// //         );
// //         alert("Album saved!");
// //         onCreate(data.data);
// //       }

// //       closeForm();
// //     } catch (err) {
// //       console.error("Error saving album:", err);
// //       alert("Failed to save album.");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const removeExistingPhoto = (url) => {
// //     setExistingPhotoUrls(existingPhotoUrls.filter((u) => u !== url));
// //   };

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center">
// //       <div className="relative bg-blue-200 p-6 rounded-2xl shadow-2xl border border-blue-400 h-full sm:h-[90%] md:h-[80%] md:w-[65%] text-white overflow-y-auto">
// //         <button
// //           onClick={closeForm}
// //           className="absolute top-3 right-3 text-white hover:text-pink-300"
// //         >
// //           <X />
// //         </button>
// //         <h2 className="text-2xl font-bold mb-4">
// //           {isEditing ? "Edit Album ✎" : "Add Photo Album ✧･ﾟ: *✧･ﾟ:*"}
// //         </h2>

// //         <form onSubmit={handleSave}>
// //           <input
// //             type="text"
// //             placeholder="Album Title"
// //             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-md font-semibold text-white placeholder:text-gray-400"
// //             value={title}
// //             onChange={(e) => setTitle(e.target.value)}
// //           />
// //           <input
// //             type="file"
// //             multiple
// //             onChange={handleUpload}
// //             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-sm"
// //           />
// //           <textarea
// //             placeholder="Add a caption..."
// //             value={caption}
// //             onChange={(e) => setCaption(e.target.value)}
// //             className="w-full bg-gray-800 p-3 rounded-md text-white placeholder:text-gray-400 mb-2"
// //           />

// //           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[url('/textures/paper.png')] h-60 overflow-y-auto bg-red-400 p-3 rounded-lg">
// //             {existingPhotoUrls.map((url, idx) => (
// //               <div key={idx} className="relative">
// //                 <img
// //                   src={url}
// //                   alt="Existing"
// //                   className="rounded-xl border-2 border-blue-400 shadow-md object-cover h-24 w-full"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => removeExistingPhoto(url)}
// //                   className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-bl"
// //                 >
// //                   ✕
// //                 </button>
// //               </div>
// //             ))}
// //             {photos.map((photo, idx) => (
// //               <img
// //                 key={idx}
// //                 src={URL.createObjectURL(photo)}
// //                 alt="Uploaded Preview"
// //                 className="rounded-xl border-2 border-blue-400 shadow-md object-cover h-24 w-full"
// //               />
// //             ))}
// //           </div>

// //           <div className="flex justify-between">
// //             <button
// //               type="submit"
// //               className="mt-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%]"
// //               disabled={uploading}
// //             >
// //               {uploading ? "Uploading..." : isEditing ? "✧・ﾟ Update ・ﾟ✧" : "✧・ﾟ Save ・ﾟ✧"}
// //             </button>
// //             <button
// //               type="button"
// //               onClick={closeForm}
// //               className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%]"
// //             >
// //               ✧・ﾟ Cancel ・ﾟ✧
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from "react";
// import { X } from "lucide-react";
// import axios from "axios";

// export default function PhotoAlbumForm({ closeForm, onCreate }) {
//   const [photos, setPhotos] = useState([]);
//   const [caption, setCaption] = useState("");
//   const [title, setTitle] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Create an axios instance with default headers
//   const token = localStorage.getItem("token");
//   const api = axios.create({
//     baseURL: "http://localhost:5000",
//     headers: {
//       Authorization: token ? `Bearer ${token}` : undefined
//     }
//   });

//   useEffect(() => {
//     if (!token) {
//       alert("No auth token found. Please log in again.");
//       closeForm();
//     }
//   }, [token, closeForm]);

//   const handleUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setPhotos((prev) => [...prev, ...files]);
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!title || photos.length === 0) {
//       return alert("Title & photos are required");
//     }

//     console.log("Using token:", token);
//     try {
//       setUploading(true);

//       // Get signed upload parameters
//       const { data: signatureData } = await api.get("/api/cloudinary-signature/signature");
//       console.log("SignatureData:", signatureData);

//       const uploadedUrls = [];
//       for (let i = 0; i < photos.length; i++) {
//         const file = photos[i];
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("api_key", signatureData.apiKey);
//         formData.append("timestamp", signatureData.timestamp);
//         formData.append("signature", signatureData.signature);
//         formData.append("folder", "album_images");

//         const res = await axios.post(
//           `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
//           formData,
//           {
//             onUploadProgress: (event) => {
//               const percent = Math.round((event.loaded * 100) / event.total);
//               setUploadProgress(percent);
//             }
//           }
//         );
//         uploadedUrls.push(res.data.secure_url);
//       }

//       // Save the uploaded memory
//       const { data } = await api.post(
//         "/api/photo-memories/create-photo-album",
//         { title, description: caption, photos: uploadedUrls }
//       );

//       alert("Memory saved!");
//       onCreate(data.data);
//       closeForm();

//     } catch (err) {
//       console.error("Error saving memory:", err.response || err);
//       alert(
//         err.response?.data?.message ||
//         "Failed to save memory. Check console/network for details."
//       );
//     } finally {
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="relative bg-blue-200 p-6 rounded-2xl shadow-2xl border border-blue-400 h-full sm:h-[90%] md:h-[80%] md:w-[65%] text-white">
//         <button
//           onClick={closeForm}
//           className="absolute top-3 right-3 text-white hover:text-pink-300"
//         >
//           <X />
//         </button>
//         <h2 className="text-2xl font-bold mb-4">Add Photo Album ✧･ﾟ: *✧･ﾟ:*</h2>

//         <form onSubmit={handleSave}>
//           <input
//             type="text"
//             placeholder="Album Title"
//             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-md font-semibold text-white placeholder:text-gray-400"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />

//           <input
//             type="file"
//             multiple
//             onChange={handleUpload}
//             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-sm"
//           />

//           <textarea
//             placeholder="Add a caption..."
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//             className="w-full bg-gray-800 p-3 rounded-md text-white placeholder:text-gray-400 mb-2"
//           />

//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[url('/textures/paper.png')] h-60 overflow-y-auto p-3 rounded-lg">
//             {photos.map((photo, idx) => (
//               <img
//                 key={idx}
//                 src={URL.createObjectURL(photo)}
//                 alt="Uploaded Preview"
//                 className="rounded-xl border-2 border-blue-400 shadow-md object-cover h-24 w-full"
//               />
//             ))}
//           </div>

//           {uploading && (
//             <p className="mt-2 text-center text-white">
//               Uploading: {uploadProgress}%
//             </p>
//           )}

//           <div className="flex justify-between mt-6">
//             <button
//               type="submit"
//               disabled={uploading}
//               className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
//             >
//               ✧・ﾟ Save・ﾟ✧
//             </button>
//             <button
//               type="button"
//               onClick={closeForm}
//               disabled={uploading}
//               className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
//             >
//               ✧・ﾟ Cancel ・ﾟ✧
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { X } from "lucide-react";
// import axios from "axios";

// export default function PhotoAlbumForm({ closeForm, onCreate }) {
//   const [photos, setPhotos] = useState([]);
//   const [caption, setCaption] = useState("");
//   const [title, setTitle] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Axios instance for backend calls with JWT
//   const token = localStorage.getItem("token");
//   const api = axios.create({
//     baseURL: "http://localhost:5000",
//     headers: { Authorization: token ? `Bearer ${token}` : undefined }
//   });

//   useEffect(() => {
//     if (!token) {
//       alert("No auth token found. Please log in.");
//       closeForm();
//     }
//   }, [token, closeForm]);

//   const handleUpload = (e) => {
//     const files = Array.from(e.target.files);
//     setPhotos((prev) => [...prev, ...files]);
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!title || photos.length === 0) {
//       return alert("Title & photos are required");
//     }

//     try {
//       setUploading(true);
//       setUploadProgress(0);

//       // Get signed upload parameters
//       const { data: signatureData } = await api.get(
//         "/api/cloudinary-signature/signature"
//       );
//       console.log("SignatureData:", signatureData);

//       // Upload each file to Cloudinary
//       const uploadedUrls = await Promise.all(
//         photos.map(async (file) => {
//           const formData = new FormData();
//           formData.append("file", file);
//           formData.append("api_key", signatureData.apiKey);
//           formData.append("timestamp", signatureData.timestamp);
//           formData.append("signature", signatureData.signature);
//           formData.append("folder", "album_images");

//           const res = await axios.post(
//             `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
//             formData,
//             {
//               headers: { "Content-Type": "multipart/form-data" },
//               onUploadProgress: (event) => {
//                 const percent = Math.round((event.loaded * 100) / event.total);
//                 setUploadProgress(percent);
//               }
//             }
//           );

//           return res.data.secure_url;
//         })
//       );

//       // Save the memory record
//       const { data } = await api.post(
//         "/api/photo-memories/create-photo-album",
//         { title, description: caption, photos: uploadedUrls }
//       );

//       alert("Memory saved!");
//       onCreate(data.data);
//       closeForm();

//     } catch (err) {
//       console.error("Error saving memory:", err.response || err);
//       alert(
//         err.response?.data?.error?.message ||
//         err.response?.data?.message ||
//         "Failed to save memory. Check console/network for details."
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="relative bg-blue-200 p-6 rounded-2xl shadow-2xl border border-blue-400 h-full sm:h-[90%] md:h-[80%] md:w-[65%] text-white">
//         <button
//           onClick={closeForm}
//           className="absolute top-3 right-3 text-white hover:text-pink-300"
//         >
//           <X />
//         </button>
//         <h2 className="text-2xl font-bold mb-4">Add Photo Album ✧･ﾟ: *✧･ﾟ:*</h2>

//         <form onSubmit={handleSave}>
//           <input
//             type="text"
//             placeholder="Album Title"
//             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-md font-semibold text-white placeholder:text-gray-400"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//           <input
//             type="file"
//             multiple
//             onChange={handleUpload}
//             className="mb-4 w-full bg-gray-700 rounded-md p-2 text-sm"
//           />
//           <textarea
//             placeholder="Add a caption..."
//             value={caption}
//             onChange={(e) => setCaption(e.target.value)}
//             className="w-full bg-gray-800 p-3 rounded-md text-white placeholder:text-gray-400 mb-2"
//           />

//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[url('/textures/paper.png')] h-60 overflow-y-auto p-3 rounded-lg">
//             {photos.map((photo, idx) => (
//               <img
//                 key={idx}
//                 src={URL.createObjectURL(photo)}
//                 alt="Uploaded Preview"
//                 className="rounded-xl border-2 border-blue-400 shadow-md object-cover h-24 w-full"
//               />
//             ))}
//           </div>

//           {uploading && (
//             <p className="mt-2 text-center text-white">
//               Uploading: {uploadProgress}%
//             </p>
//           )}

//           <div className="flex justify-between mt-6">
//             <button
//               type="submit"
//               disabled={uploading}
//               className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
//             >
//               ✧・ﾟ Save・ﾟ✧
//             </button>
//             <button
//               type="button"
//               onClick={closeForm}
//               disabled={uploading}
//               className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold text-white w-[40%] disabled:opacity-50"
//             >
//               ✧・ﾟ Cancel ・ﾟ✧
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
