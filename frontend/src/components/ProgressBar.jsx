import React from 'react';

export default function ProgressBar({ progress }) {
    if (progress <= 0) return null;
    return (
        <div className="w-full bg-gray-200 h-2">
            <div
                className="h-2 bg-indigo-500 transition-all duration-100 ease-linear"
                style={{ width: `${Math.min(progress, 100)}%` }}
            />
        </div>
    );
}
