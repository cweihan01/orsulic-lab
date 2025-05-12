import React from 'react';
import QueryForm from './QueryForm';
import QueryHistory from './QueryHistory';

export default function QueryContainer({
    openModal,
    onQuery,
    isCollapsed,
    queryHistory,
    clearQueryHistory,
}) {
    if (isCollapsed) return <></>;

    return (
        <div className="flex flex-col w-full">
            <QueryForm
                key={isCollapsed ? 'collapsed' : 'expanded'}
                onSubmit={onQuery}
                isCollapsed={isCollapsed}
                lastQuery={queryHistory[0]}
            />

            <button
                onClick={openModal}
                style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                className="my-4 px-4 py-2 text-white rounded-lg hover:opacity-85"
            >
                View Feature Names
            </button>

            <QueryHistory
                history={queryHistory}
                onSelect={onQuery}
                onClear={clearQueryHistory}
            />
        </div>
    );
}
