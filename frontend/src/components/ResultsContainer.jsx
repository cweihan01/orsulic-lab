import React, { useRef, useEffect, useState } from 'react';
import ScatterPlot from './ScatterPlot';
import CorrelationResult from './CorrelationResult';
import LoadingIcon from './LoadingIcon';
import axios from 'axios';

export default function ResultsContainer({
    correlationsMap,
    lastQuery,
    isLoading,
    onRequery,
    onCancel,
}) {
    const [scatterData, setScatterData] = useState([]);
    const [plotType, setPlotType] = useState('spearman');
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [feature1Type, setFeature1Type] = useState(null);
    const [feature2Type, setFeature2Type] = useState(null);

    const resultsRef = useRef(null);

    /** Scroll to top of results section */
    const handleScrollToTop = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Auto-scroll to top of results section when loading or new correlations arrive
    useEffect(() => handleScrollToTop(), [isLoading, correlationsMap]);

    // Close any existing graph once new correlations arrive
    useEffect(() => handleCloseGraph(), [correlationsMap]);

    /** Request scatter data from API when graph displayed */
    const handleScatterRequest = (
        feature1,
        feature2,
        database1,
        database2,
        plotTypeOverride
    ) => {
        // Close open graph if any
        handleCloseGraph();
        setHighlightedRow(feature2);
        setPlotType(plotTypeOverride);
        const payload = { feature1, feature2, database1, database2 };

        axios
            .post(`${process.env.REACT_APP_API_ROOT}scatter/`, payload)
            .then((response) => {
                setScatterData(response.data.scatter_data);
                setFeature1Type(response.data.feature1_type);
                setFeature2Type(response.data.feature2_type);
            })
            .catch((error) => {
                console.error('Error posting scatter data:', error);
            })
            .finally(() => handleScrollToTop());
    };

    /** Close graph by deleting scatter data */
    const handleCloseGraph = () => {
        setHighlightedRow(null);
        setScatterData([]);
    };

    return (
        <div
            ref={resultsRef}
            className="flex-1 flex-col overflow-y-auto px-4 py-2 custom-scrollbar"
        >
            {/* Loading icon */}
            {isLoading && <LoadingIcon onCancel={onCancel} />}

            {/* Graph (scatter/box/bar plot) */}
            <ScatterPlot
                data={scatterData}
                handleCloseGraph={handleCloseGraph}
                plotType={plotType}
                feature1Type={feature1Type}
                feature2Type={feature2Type}
            />

            {/* Table of correlation results */}
            <CorrelationResult
                correlationsMap={correlationsMap}
                minCorrelation={parseFloat(lastQuery.minCorrelation ?? 0)}
                maxPValue={parseFloat(lastQuery.maxPValue ?? 1)}
                onScatterRequest={handleScatterRequest}
                highlightedRow={highlightedRow}
                onRequery={onRequery}
                onScrollToTop={handleScrollToTop}
            />
        </div>
    );
}
