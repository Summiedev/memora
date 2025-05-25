// components/MemoryModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function MemoryModal({ memory, type, onClose, onSave }) {
  const isPhoto = type === "photo";
  const [isEditing, setIsEditing] = useState(false);

  // form fields:
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState([]);
  const [entryText, setEntryText] = useState("");   

  // on open or memory change, prefill:
  useEffect(() => {
     console.log("MemoryModal got:", { type, memory });
    setIsEditing(false);
    setTitle(memory.title);
    if (isPhoto) {
      setCaption(memory.description);
      setPhotos(memory.photos.map(url => ({ url, isNew: false })));
    } else {     
     setEntryText(memory.content || "");       
    }
    // else for diary: set body, date, stickers, etc.
  }, [memory, isPhoto]);

  const handleFileChange = e => {
    const newOnes = Array.from(e.target.files).map(f => ({ file: f, isNew: true }));
    setPhotos(p => [...p, ...newOnes]);
  };

  const handleSave = async () => {
    // similar to earlier: upload new images, merge URLs…
    let finalPhotos = photos
      .filter(p => !p.isNew)
      .map(p => p.url);

    // upload the new ones:
   if (isPhoto) {
  try {
    const folderName = "capsule_media";
    const { data: sig } = await axios.get(
      `http://localhost:5000/api/cloudinary-signature/signature?folder=${folderName}`
    );

    if (!sig || !sig.apiKey || !sig.signature || !sig.timestamp || !sig.cloudName) {
      throw new Error("Invalid signature data received");
    }

    const uploaded = await Promise.all(
      photos
        .filter((p) => p.isNew)
        .map(async ({ file }) => {
          const form = new FormData();
          form.append("file", file);
          form.append("api_key", sig.apiKey);
          form.append("timestamp", sig.timestamp);
          form.append("signature", sig.signature);
          form.append("folder", folderName); // Corrected here

          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            form
          );

          if (res.status !== 200) {
            throw new Error(`Failed to upload image: ${res.statusText}`);
          }

          return res.data.secure_url;
        })
    );

    finalPhotos = [...finalPhotos, ...uploaded]
    } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    alert("Failed to upload photos. Please try again.");
    return; // Stop if upload fails
  }
}

    // build payload:
    const payload = {
      title,
      ...(isPhoto
        ? { description: caption, photos: finalPhotos }
         : { content: entryText, date: memory.createdAt }),
    };

    // PATCH request:
    const { data } = await axios.patch(
      `http://localhost:5000/api/${isPhoto ? "photo-memories" : "diary-entries"}/${memory._id}`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    onSave(data.data);
  };

  return (
   <div className="fixed inset-0 flex items-center justify-center quicksand  bg-black/50 z-50">
  <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-xl relative">
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-500 hover:text-blue-600"
    >
      <X size={24} />
    </button>

    {!isEditing ? (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-blue-600 overflow-hidden text-ellipsis whitespace-normal break-words">{title}</h2>
        {isPhoto ? (
          <>
            <p className="text-gray-600 italic">
              {new Date(memory.createdAt).toLocaleDateString()}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {memory.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="h-28 w-full object-cover rounded-xl shadow-md"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 italic">
              {new Date(memory.createdAt).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap text-gray-800 reenie-beanie-regular p-4 bg-gray-50 rounded-lg shadow-sm">
              {memory.content}
            </p>
          </>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-6 bg-gradient-to-r from-blue-400 to-purple-700 text-white px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition transform"
        >
          Edit
        </button>
      </div>
    ) : (
      <div className="space-y-6">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border-2 text-black overflow-hidden text-ellipsis whitespace-normal break-words border-gray-300 rounded-xl p-3 focus:border-blue-400 outline-none"
          placeholder="Title"
        />
        {isPhoto ? (
          <>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full border-2 text-blue-400Fw border-gray-300 rounded-xl p-3  focus:border-blue-400 outline-none"
              placeholder="Caption"
            />
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
            <div className="grid grid-cols-3 gap-3 mt-3">
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p.isNew ? URL.createObjectURL(p.file) : p.url}
                  className="h-28 w-full object-cover rounded-xl shadow-md"
                />
              ))}
            </div>
          </>
        ) : (
          <textarea
            rows={8}
            value={entryText}
            onChange={e => setEntryText(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-black reenie-beanie-regular focus:border-blue-400 outline-none"
            placeholder="Diary Entry"
          />
        )}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-5 py-2 bg-gray-200 rounded-xl shadow hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-xl shadow-lg hover:scale-105 transition transform"
          >
            Save
          </button>
        </div>
      </div>
    )}
  </div>
</div>

  );
}
