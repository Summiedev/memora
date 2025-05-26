// components/MoodPromptModal.jsx
import React from 'react';

const moods = [
  { label: '😞', value: 1 },
  { label: '😕', value: 2 },
  { label: '😐', value: 3 },
  { label: '🙂', value: 4 },
  { label: '😄', value: 5 }
];

export default function MoodPromptModal({ onSelect }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">How are you feeling today?</h2>
        <div className="flex justify-between">
          {moods.map(m => (
            <button
              key={m.value}
              className="text-2xl hover:scale-125 transition"
              onClick={() => onSelect(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
