import React from 'react';
import QueryForm from './QueryForm';
import QueryHistory from './QueryHistory';

export default function QueryContainer({
    openModal,
    onQuery,
    isCollapsed,
    queryHistory,
    clearQueryHistory,
    onToggleSidebar,
}) {
    return (
        <div className= "relative h-full">
            <button
                onClick={onToggleSidebar}
                className={`collapse-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}
                aria-label="Toggle sidebar"
            >
                {isCollapsed ? '▶' : '◀'}
            </button>
            <div
                className={`relative h-full flex-shrink-0 flex flex-col px-6 py-2
                    bg-gradient-to-b from-blue-200 to-purple-200
                    transition-width duration-200
                    overflow-y-auto custom-scrollbar
                    sidebar ${ isCollapsed ? 'collapsed w-6 px-0' : 'w-[500px]'}
                `}
            >
                {!isCollapsed && (
                    <>
                        <QueryForm
                            key={isCollapsed ? 'collapsed' : 'expanded'}
                            onSubmit={onQuery}
                            isCollapsed={isCollapsed}
                            lastQuery={queryHistory[0]}
                        />

                        <button
                            onClick={openModal}
                            style={{
                                backgroundColor: '#78aee8',
                                fontFamily: 'Futura',
                            }}
                            className="my-4 px-4 py-2 text-white rounded-lg hover:opacity-85"
                        >
                            View Nuclear Features
                        </button>

                        <QueryHistory
                            history={queryHistory}
                            onSelect={onQuery}
                            onClear={clearQueryHistory}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
