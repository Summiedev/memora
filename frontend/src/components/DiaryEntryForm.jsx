import React, { useState } from "react";
import axios from "axios";

export function DiaryEntryForm({ closeForm, onCreate }) {
  const [title, setTitle] = useState("");
  const [entryText, setEntryText] = useState("");
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddSticker = (sticker) => {
    setEntryText((prev) => prev + " " + sticker);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !entryText) return alert("Title and entry text are required");

    const memory = {
      title,
      entryText,
      date: new Date().toISOString(),
    };

    try {
      setLoading(true);

      // Send the data to the backend
       const { data } = await axios.post(
        "http://localhost:5000/api/diary-entries/create-diary",
        memory,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

         const created = data.data;
      alert("Memory saved!");
        onCreate(created);
      // if (onCreate) onCreate();
      closeForm();
    } catch (error) {
      console.error("Error saving memory:", error);
      alert("Failed to save memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-paper bg-cover bg-center shadow-2xl rounded-2xl h-full sm:h-[90%] md:h-[80%] md:w-[65%] mx-4 p-6 border-4 border-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl dancing-script text-blue-700">New Diary Entry ✧･ﾟ</h2>
          <span className="text-sm text-gray-500 font-light">{new Date().toLocaleDateString()}</span>
        </div>

        <form onSubmit={handleSave}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Memory Title"
            className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 quicksand text-2xl font-bold text-gray-800 focus:outline-none"
          />

          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="Write your memory here..."
            rows={10}
            className="w-full reenie-beanie-regular text-2xl font-semibold font-stretch-100% bg-transparent resize-none focus:outline-none text-gray-800"
          />

          <div className="mt-4 space-x-2">
            <button
              type="button"
              onClick={() => handleAddSticker("✧･ﾟ")}
              className="text-2xl hover:scale-110 transition"
            >
              ✧･ﾟ
            </button>
            <button
              type="button"
              onClick={() => handleAddSticker("❀⋆｡˚")}
              className="text-2xl hover:scale-110 transition"
            >
              ❀⋆｡˚
            </button>
            <button
              type="button"
              onClick={() => handleAddSticker("✿｡.:*")}
              className="text-2xl hover:scale-110 transition"
            >
              ✿｡.:*
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-400 hover:bg-blue-600 text-white rounded-xl shadow-lg font-bold"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-blue-400 hover:bg-blue-600 text-white rounded-xl shadow-lg font-bold"
            >
              Add to Capsule
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl shadow-lg font-bold px-6 py-2 bg-red-400 hover:bg-red-500 text-white hover:text-pink-300"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
