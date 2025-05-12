// src/components/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, onClose, src }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 hover:bg-red-600"
                >
                    X
                </button>
                <iframe src={src} className="w-full h-[80vh] p-4" title="Popup PDF" />
            </div>
        </div>
    );
}
