import React from 'react';

export default function LoadingIcon({ onCancel }) {
    return (
        <div className="flex items-center justify-center mb-4 space-x-3">
            <div className="loader w-6 h-6"></div>
            <span className="text-gray-600">Loading query results…</span>
            <button
                onClick={onCancel}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Cancel
            </button>
        </div>
    );
}
