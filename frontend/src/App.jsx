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

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

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
            });
    };

    const handleScatterRequest = (feature1, feature2, database1, database2, plotTypeOverride) => {
        setHighlightedRow(feature2);
        setPlotType(plotTypeOverride); // ← now actually uses the correct type

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
            <Header />

            <div className="sidebar-layout">
                <aside className={`sidebar ${isQueryFormCollapsed ? 'collapsed' : ''}`}>
                    {/* Collapse button at top-right of this panel */}
                    <div className="sidebar-header">
                        <button
                            onClick={handleCollapseQueryForm}
                            className="collapse-btn"
                            aria-label="Toggle Sidebar"
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
                </aside>

                <main className="main-panel">
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
                </main>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} src="./sample.pdf" />
        </div>
    );
}

export default App;
