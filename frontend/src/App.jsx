import React, { useState, useRef } from 'react';
import QueryForm from './components/QueryForm';
import CorrelationResult from './components/CorrelationResult';
import ScatterPlot from './components/ScatterPlot';
import QueryHistory from './components/QueryHistory';
import axios from 'axios';
import './App.css';
import './index.js';
import Header from './components/Header.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import QueryContainer from './components/QueryContainer.jsx';

function App() {
    const [correlationsMap, setCorrelationsMap] = useState({});
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [scatterData, setScatterData] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQueryFormCollapsed, setIsQueryFormCollapsed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previousQuery, setPreviousQuery] = useState(null); 
    const [queryHistory, setQueryHistory] = useState([]);    
    const [plotType, setPlotType] = useState("spearman");
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef(null);
    const progressRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleCloseGraph = () => {
        setHighlightedRow(null);
        setScatterData([]);
    };

    const handleCollapseQueryForm = () => {
        if (!scatterData) setIsQueryFormCollapsed(false);
        else setIsQueryFormCollapsed(!isQueryFormCollapsed);
    };

    const startProgressSimulation = () => {
        setProgress(0);
        if (progressRef.current) clearInterval(progressRef.current);
        progressRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 3 + 1;
            });
        }, 100);
    };

    const stopProgressSimulation = () => {
        clearInterval(progressRef.current);
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
    };

    const handleQuery = (query) => {
        // Cancel any previous request
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsLoading(true);
        
        handleCloseGraph();
        
        setMinCorrelation(parseFloat(query.minCorrelation));
        setMaxPValue(parseFloat(query.maxPValue));
        setPreviousQuery(query);
        setQueryHistory(prev => [query, ...prev.slice(0, 19)]);
        console.log(queryHistory);
        
        // Scroll to top
        startProgressSimulation();
        window.scrollTo({top: 0, behavior: 'smooth'});

        axios
            .post(`${process.env.REACT_APP_API_ROOT}correlations/`, {
                feature1: query.feature1,
                feature2: query.feature2,
                database1: query.database1,
                database2: query.database2,
            }, {
                signal: controller.signal
            })
            .then((response) => {
                setCorrelationsMap(response.data.correlations);
            })
            .catch((err) => {
                if (err.name === 'CanceledError' || err.message === 'canceled') {
                    console.log('Query was cancelled by user');
                } else {
                    console.error('Error fetching correlations:', err);
                }
            })
            .finally(() => {
                setIsLoading(false);
                stopProgressSimulation();
            });
    };


    
    const handleScatterRequest = (feature1, feature2, database1, database2, plotTypeOverride) => {
        setHighlightedRow(feature2);
        setPlotType(plotTypeOverride);  // ← now actually uses the correct type
        

        const scatterData = { feature1, feature2, database1, database2 };

        axios
            .post(`${process.env.REACT_APP_API_ROOT}scatter/`, scatterData)
            .then((response) => {
                setScatterData(response.data.scatter_data);
            })
            .catch((error) => {
                console.error('Error posting scatter data:', error);
            });
    };

    const handleRequery = (newFeature1, newDatabase1) => {
        if (!previousQuery) return;
        const updatedQuery = {
            ...previousQuery,
            feature1: newFeature1,
            database1: [newDatabase1],
        };
        handleQuery(updatedQuery);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <header className="custom-header">
                <div className="logo-container">
                    <img src="/UCLA_Orsulic_Lab_Logo.png" alt="UCLA Orsulic Lab Logo" className="logo-img" />
                </div>
                <div className="title-container">
                    <h1 className="header-title">Cell Line Database</h1>
                </div>
            </header> */}
            <Header />

            {/* {progress > 0 && (
                <div className="w-full bg-gray-200 h-2">
                    <div
                        className="h-2 bg-indigo-500 transition-all duration-100 ease-linear"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            )} */}

            <ProgressBar progress={progress} />

            <div className="main-grid">
                {/* <div className={`panel ${isQueryFormCollapsed ? 'left-panel-collapsed' : 'left-panel-expanded'}`}>
                    <QueryForm
                        onSubmit={handleQuery}
                        isCollapsed={isQueryFormCollapsed}
                        toggleCollapse={handleCollapseQueryForm}
                    />
                    {!isQueryFormCollapsed && (
                        <>
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
                                onSelect={handleQuery}
                                onClear={() => setQueryHistory([])}
                            />
                        </>
                    )}
                </div> */}

                <div
                    className={`panel ${
                        isQueryFormCollapsed ? 'left-panel-collapsed' : 'left-panel-expanded'
                    }`}
                >

                    {/* Collapse button at top-right of this panel */}
                    <div className="flex justify-end p-2">
                        <button
                        onClick={handleCollapseQueryForm}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                            {isQueryFormCollapsed ? '▶' : '◀'}
                        </button>
                    </div>

                    <QueryContainer
                        openModal={openModal}
                        onQuery={handleQuery}
                        isCollapsed={isQueryFormCollapsed}
                        queryHistory={queryHistory}
                        clearQueryHistory={() => setQueryHistory([])}
                    />
                </div>

                <div className={`panel ${isQueryFormCollapsed ? 'right-panel-collapsed' : 'right-panel-expanded'}`}>
                    {scatterData.length > 0 && (
                        <ScatterPlot data={scatterData} handleCloseGraph={handleCloseGraph} plotType={plotType} />
                    )}

                    <CorrelationResult
                        correlationsMap={correlationsMap}
                        minCorrelation={minCorrelation}
                        maxPValue={maxPValue}
                        onScatterRequest={handleScatterRequest}
                        highlightedRow={highlightedRow}
                        onRequery={handleRequery}
                        isLoading={isLoading}
                        onCancel={() => abortControllerRef.current?.abort()}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 hover:bg-red-600"
                        >
                            X
                        </button>
                        <iframe src="/sample.pdf" className="w-full h-[80vh] p-4" title="Popup PDF"></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
