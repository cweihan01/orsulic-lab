import React, { useState, useEffect, useRef } from 'react';
import QueryForm from './components/QueryForm';
import CorrelationResult from './components/CorrelationResult';
import ScatterPlot from './components/ScatterPlot';
import axios from 'axios';
import './App.css';
import './index.js';

function App() {
    const [correlations, setCorrelations] = useState([]);
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [scatterData, setScatterData] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQueryFormCollapsed, setIsQueryFormCollapsed] = useState(false);
    const [progress, setProgress] = useState(0); // 💡 percent-based loading
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
                return prev + Math.random() * 3 + 1; // Simulate 1–4% increase
            });
        }, 100);
    };

    const stopProgressSimulation = () => {
        clearInterval(progressRef.current);
        setProgress(100); // Finish the bar
        setTimeout(() => setProgress(0), 500); // Reset bar after short delay
    };

    // 🔄 Updated with percentage progress bar
    const handleQuery = (query) => {
        console.log('Handling POST query to /correlations/...');
        console.log('Query:', query);

        setMinCorrelation(parseFloat(query.minCorrelation));
        setMaxPValue(parseFloat(query.maxPValue));
        startProgressSimulation();

        axios
            .post(`${process.env.REACT_APP_API_ROOT}correlations/`, {
                feature1: query.feature1,
                feature2: query.feature2,
                database1: query.database1,
                database2: query.database2,
            })
            .then((response) => {
                console.log('Retrieved correlations:', response);
                setCorrelations(response.data.correlations);
            })
            .catch((err) => {
                console.error('Error fetching correlations:', err);
            })
            .finally(() => {
                stopProgressSimulation();
            });
    };

    const handleScatterRequest = (feature1, feature2, database1, database2) => {
        setHighlightedRow(feature2);
        const scatterData = { feature1, feature2, database1, database2 };

        console.log(scatterData);
        axios
            .post(`${process.env.REACT_APP_API_ROOT}scatter/`, scatterData)
            .then((response) => {
                console.log('Scatter data:', response.data.scatter_data);
                setScatterData(response.data.scatter_data);
            })
            .catch((error) => {
                console.error('Error posting scatter data:', error);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section*/}
            <header className="bg-[#a1cdf9] text-black py-3 md:flex items-center justify-between px-6 shadow-md w-full">
                {/* Logo - left aligned */}
                <div className="flex justify-center md:justify-start">
                <img
                    src="/UCLA_Orsulic_Lab_Logo.png"
                    alt="UCLA Orsulic Lab Logo"
                    className="h-12 w-auto sm:m-auto md:m-0"
                />
                </div>

                {/* Title - centered or right aligned depending on screen size*/}
                <div className="flex justify-center lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                    <h1 className="text-4xl font-bold text-center">Database Query Interface</h1>
                </div>
            </header>

            {/* 📊 Progress Bar */}
            {progress > 0 && (
                <div className="w-full bg-gray-200 h-2">
                    <div
                        className="h-2 bg-indigo-500 transition-all duration-100 ease-linear"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 p-6">
                {/* Left Column */}
                <div
                    className={
                        isQueryFormCollapsed
                            ? 'col-span-1 bg-white shadow-md rounded-lg p-4'
                            : 'col-span-5 bg-white shadow-md rounded-lg p-4'
                    }
                >
                    <QueryForm
                        onSubmit={handleQuery}
                        isCollapsed={isQueryFormCollapsed}
                        toggleCollapse={handleCollapseQueryForm}
                    />

                    {!isQueryFormCollapsed && (
                        <div className="mt-6">
                            <button
                                onClick={openModal}
                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                            >
                                View Feature Names
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div
                    className={
                        isQueryFormCollapsed
                            ? 'col-span-11 bg-white shadow-md rounded-lg p-4'
                            : 'col-span-7 bg-white shadow-md rounded-lg p-4'
                    }
                >
                    {scatterData.length > 0 && (
                        <ScatterPlot data={scatterData} handleCloseGraph={handleCloseGraph} />
                    )}
                    <CorrelationResult
                        data={correlations}
                        minCorrelation={minCorrelation}
                        maxPValue={maxPValue}
                        onScatterRequest={handleScatterRequest}
                        highlightedRow={highlightedRow}
                    />
                </div>
            </div>

            {/* Modal for PDF */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 hover:bg-red-600"
                        >
                            X
                        </button>
                        <iframe
                            src="/sample.pdf"
                            className="w-full h-[80vh] p-4"
                            title="Popup PDF"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
