import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Modal from './components/Modal.jsx';
import QueryContainer from './components/QueryContainer.jsx';
import ResultsContainer from './components/ResultsContainer.jsx';

import './App.css';
import './index.js';
import { MAX_QUERY_HISTORY_LENGTH } from './utils/constants.js';

function App() {
    const [queryHistory, setQueryHistory] = useState(() => {
        const saved = localStorage.getItem('queryHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [correlationsMap, setCorrelationsMap] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const abortControllerRef = useRef(null);

    // Whenever queryHistory changes, save to localStorage
    useEffect(() => {
        localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    }, [queryHistory]);

    /** Toggle sidebar state */
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
        // HACK: tell Plotly to resize graph (if there is one) after collapsing
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    };

    /** Scroll to top of screen */
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /** Fetch correlation data from API when user clicks 'query' button */
    const handleQuery = (query) => {
        // Cancel any previous request
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsLoading(true);
        scrollToTop();
        console.log(query)

        // Add this query to history, retaining the given max number
        setQueryHistory((prev) => [
            query,
            ...prev.slice(0, MAX_QUERY_HISTORY_LENGTH - 1),
        ]);

        // Make API request
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
                console.log(response.data.correlations)
                setCorrelationsMap(response.data.correlations);
            })
            .catch((err) => {
                if (
                    err.name === 'CanceledError' ||
                    err.message === 'canceled'
                ) {
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

    /** Fetch correlation data when user clicks a feature in the table */
    const handleRequery = (newFeature1, newDatabase1) => {
        const last = queryHistory[0];
        if (!last) return;

        const updatedQuery = {
            ...last,
            feature1: newFeature1,
            database1: [newDatabase1],
            // HACK: helps to populate form fields, but may not work if >1 subcategories
            // Should eventually keep track of subcategories either using API or state
            subcategory1: last.subcategory2,
        };
        handleQuery(updatedQuery);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="relative flex flex-1 overflow-y-auto custom-scrollbar">
                {/* Query section: query form, feature names, query history */}
                <QueryContainer
                    openModal={() => setIsModalOpen(true)}
                    onQuery={handleQuery}
                    isCollapsed={isSidebarCollapsed}
                    queryHistory={queryHistory}
                    clearQueryHistory={() => setQueryHistory([])}
                    onToggleSidebar={handleToggleSidebar}
                />

                {/* Results section: graph, correlation table */}
                <ResultsContainer
                    correlationsMap={correlationsMap}
                    lastQuery={queryHistory[0] ?? {}}
                    onRequery={handleRequery}
                    isLoading={isLoading}
                    onCancel={() => abortControllerRef.current?.abort()}
                />
            </main>

            {/* Popup feature names */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                src="./sample.pdf"
            />
        </div>
    );
}

export default App;
