import React from 'react';

function QueryHistory({ history, onSelect, onClear }) {
    const formatFeature2 = (features) => {
        const maxToShow = 3;
        if (!features || features.length === 0) return '';
        if (features.length <= maxToShow) return features.join(', ');
        return `${features.slice(0, maxToShow).join(', ')}, ... (+${features.length - maxToShow})`;
    };

    return (
        <div className="w-full bg-white shadow-md rounded-lg p-4 my-2">
            <div className="flex justify-between items-center mb-2">
                <h3 
                    className="text-lg font-semibold" 
                    style={{ fontFamily: 'Futura' }}
                >
                    Query History
                </h3>
                <button
                    onClick={onClear}
                    style={{ fontFamily: 'Futura' }}
                    className="text-sm text-red-500 hover:underline"
                >
                    Clear History
                </button>
            </div>
            {history.length === 0 ? (
                <p className="text-sm text-gray-500">No recent queries.</p>
            ) : (
                <ul className="space-y-1 max-h-64 overflow-y-auto text-sm">
                    {history.map((q, index) => (
                        <li key={index} className="truncate">
                            <button
                                className="text-blue-600 hover:underline w-full text-left truncate"
                                onClick={() => onSelect(q)}
                            >
                                {q.feature1} vs [{formatFeature2(q.feature2)}]
                            </button>
                            <div className="text-gray-500 text-xs truncate">
                                DB1: {q.database1.join(', ')} | DB2: {q.database2.join(', ')}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QueryHistory;
