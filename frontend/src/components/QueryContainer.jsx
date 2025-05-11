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
    return (
        <div className="h-full flex flex-col">
            {!isCollapsed && (
                <>
                    <QueryForm
                        key={isCollapsed ? 'collapsed' : 'expanded'}
                        onSubmit={onQuery}
                        isCollapsed={isCollapsed}
                        lastQuery={queryHistory[0]}
                    />
                    <div className="mt-6">
                        <button
                            onClick={openModal}
                            style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                            className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-85"
                        >
                            View Feature Names
                        </button>
                    </div>
                    <QueryHistory
                        history={queryHistory}
                        onSelect={onQuery}
                        onClear={clearQueryHistory}
                    />
                </>
            )}
        </div>
    );
}
