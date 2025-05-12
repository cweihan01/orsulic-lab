import axios from 'axios';
import { useRef, useState } from 'react';
import CorrelationResult from './components/CorrelationResult';
import Header from './components/Header.jsx';
import Modal from './components/Modal.jsx';
import QueryContainer from './components/QueryContainer.jsx';
import ScatterPlot from './components/ScatterPlot';

import './App.css';
import './index.js';

function App() {
    const [correlationsMap, setCorrelationsMap] = useState({});
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [scatterData, setScatterData] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQueryFormCollapsed, setIsQueryFormCollapsed] = useState(false);
    const [previousQuery, setPreviousQuery] = useState(null);
    const [queryHistory, setQueryHistory] = useState([]);
    const [selectedTab, setSelectedTab] = useState('spearman');
    const [plotType, setPlotType] = useState('spearman');
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef(null);
    const resultsContainerRef = useRef(null);

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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (resultsContainerRef.current) {
            resultsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

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
        setQueryHistory((prev) => [query, ...prev.slice(0, 19)]);
        console.log(queryHistory);

        scrollToTop();

        axios
            .post(
                `${process.env.REACT_APP_API_ROOT}correlations/`,
                {
                    feature1: query.feature1,
                    feature2: query.feature2,
                    database1: query.database1,
                    database2: query.database2,
                },
                {
                    signal: controller.signal,
                }
            )
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
                scrollToTop();
            });
    };

    const handleScatterRequest = (feature1, feature2, database1, database2, plotTypeOverride) => {
        setHighlightedRow(feature2);
        setPlotType(plotTypeOverride);

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
        <div className="h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="relative flex flex-1 overflow-auto">
                {/* Sidebar section: query form, feature names, query history */}
                <div
                    className={`h-full flex-shrink-0 flex flex-col px-6 py-2 bg-gradient-to-b
                        from-blue-200 to-purple-200 overflow-y-auto transition-width
                        duration-300 ${isQueryFormCollapsed ? 'w-6 px-0' : 'w-[500px]'}`}
                >
                    <div className={`${isQueryFormCollapsed ? 'hidden' : 'block'} flex-1`}>
                        <QueryContainer
                            openModal={openModal}
                            onQuery={handleQuery}
                            isCollapsed={isQueryFormCollapsed}
                            queryHistory={queryHistory}
                            clearQueryHistory={() => setQueryHistory([])}
                        />
                    </div>
                </div>

                {/* Button to toggle sidebar collapse */}
                <button
                    onClick={handleCollapseQueryForm}
                    className="absolute top-1/2 -ml-2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg focus:outline-none"
                    aria-label="Toggle sidebar"
                >
                    {isQueryFormCollapsed ? '▶' : '◀'}
                </button>

                {/* Results section: graph, correlation table */}
                <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-8">
                    {scatterData.length > 0 && (
                        <ScatterPlot
                            data={scatterData}
                            handleCloseGraph={handleCloseGraph}
                            plotType={plotType}
                        />
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
            </main>

            {/* Popup feature names */}
            <Modal isOpen={isModalOpen} onClose={closeModal} src="./sample.pdf" />
        </div>
    );
}

export default App;
