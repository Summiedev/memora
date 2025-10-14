import React from 'react';

export default function NoPhotosModal({ onClose }) {
  return (
    // Full‐screen backdrop
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal box */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-xs w-full">
        <div className="text-white p-10 text-center">
          No photos available
        </div>
        <div className="text-center">
          <button
            onClick={onClose}
            className="mt-2 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
