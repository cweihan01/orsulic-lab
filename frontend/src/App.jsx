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
    const [queryHistory, setQueryHistory] = useState([]);
    const [correlationsMap, setCorrelationsMap] = useState({});
    const [scatterData, setScatterData] = useState([]);
    const [plotType, setPlotType] = useState('spearman');
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const abortControllerRef = useRef(null);
    const resultsContainerRef = useRef(null);

    const handleCollapseSidebar = () => {
        if (!scatterData) setSidebarCollapsed(false);
        else setSidebarCollapsed(!isSidebarCollapsed);

        // Hack to tell Plotly to resize graph (if there is one) after collapsing
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    };

    const handleCloseGraph = () => {
        setHighlightedRow(null);
        setScatterData([]);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (resultsContainerRef.current) {
            resultsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleQuery = (query) => {
        // Cancel any previous request
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsLoading(true);

        handleCloseGraph();
        scrollToTop();

        setQueryHistory((prev) => [query, ...prev.slice(0, 19)]);

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

    const handleRequery = (newFeature1, newDatabase1) => {
        const last = queryHistory[0];
        if (!last) return;

        const updatedQuery = {
            ...last,
            feature1: newFeature1,
            database1: [newDatabase1],
        };
        handleQuery(updatedQuery);
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

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="relative flex flex-1 overflow-y-auto custom-scrollbar">
                {/* Sidebar section: query form, feature names, query history */}
                <div
                    className={`h-full flex-shrink-0 flex flex-col px-6 py-2 bg-gradient-to-b
                        from-blue-200 to-purple-200 overflow-y-auto transition-width
                        duration-200 custom-scrollbar
                        ${isSidebarCollapsed ? 'w-6 px-0' : 'w-[500px]'}`}
                >
                    <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} flex-1`}>
                        <QueryContainer
                            openModal={() => setIsModalOpen(true)}
                            onQuery={handleQuery}
                            isCollapsed={isSidebarCollapsed}
                            queryHistory={queryHistory}
                            clearQueryHistory={() => setQueryHistory([])}
                        />
                    </div>
                </div>

                {/* Button to toggle sidebar collapse */}
                <button
                    onClick={handleCollapseSidebar}
                    className="absolute top-1/2 -ml-2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg focus:outline-none"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarCollapsed ? '▶' : '◀'}
                </button>

                {/* Results section: graph, correlation table */}
                <div
                    ref={resultsContainerRef}
                    className="flex-1 flex-col overflow-y-auto p-8 custom-scrollbar"
                >
                    {scatterData.length > 0 && (
                        <ScatterPlot
                            data={scatterData}
                            handleCloseGraph={handleCloseGraph}
                            plotType={plotType}
                        />
                    )}

                    <CorrelationResult
                        correlationsMap={correlationsMap}
                        minCorrelation={
                            queryHistory.length ? parseFloat(queryHistory[0].minCorrelation) : 0.0
                        }
                        maxPValue={
                            queryHistory.length ? parseFloat(queryHistory[0].maxPValue) : 1.0
                        }
                        onScatterRequest={handleScatterRequest}
                        highlightedRow={highlightedRow}
                        onRequery={handleRequery}
                        isLoading={isLoading}
                        onCancel={() => abortControllerRef.current?.abort()}
                    />
                </div>
            </main>

            {/* Popup feature names */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} src="./sample.pdf" />
        </div>
    );
}

export default App;
