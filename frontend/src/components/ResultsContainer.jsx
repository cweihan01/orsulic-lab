import React, { useRef, useEffect } from 'react';
import ScatterPlot from './ScatterPlot';
import CorrelationResult from './CorrelationResult';
import LoadingIcon from './LoadingIcon';

export default function ResultsContainer({
    scatterData,
    correlationsMap,
    queryHistory,
    highlightedRow,
    isLoading,
    onScatterRequest,
    onRequery,
    onCancel,
    handleCloseGraph,
    plotType,
}) {
    const resultsRef = useRef(null);

    // Auto-scroll to top of results section when loading, new correlations arrive,
    // or graph plotted
    useEffect(() => {
        if (resultsRef.current) {
            resultsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isLoading, correlationsMap, scatterData]);

    return (
        <div
            ref={resultsRef}
            className="flex-1 flex-col overflow-y-auto p-8 custom-scrollbar"
        >
            {/* Loading icon */}
            {isLoading && <LoadingIcon onCancel={onCancel} />}

            <ScatterPlot
                data={scatterData}
                handleCloseGraph={handleCloseGraph}
                plotType={plotType}
            />

            <CorrelationResult
                correlationsMap={correlationsMap}
                minCorrelation={
                    queryHistory.length
                        ? parseFloat(queryHistory[0].minCorrelation)
                        : 0.0
                }
                maxPValue={
                    queryHistory.length
                        ? parseFloat(queryHistory[0].maxPValue)
                        : 1.0
                }
                onScatterRequest={onScatterRequest}
                highlightedRow={highlightedRow}
                onRequery={onRequery}
            />
        </div>
    );
}
