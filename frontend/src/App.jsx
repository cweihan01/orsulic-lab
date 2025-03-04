import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import CorrelationResult from "./components/CorrelationResult";
import ScatterPlot from "./components/ScatterPlot"; // Import ScatterPlot component
import axios from "axios";
import "./App.css";
import './index.js';

function App() {
    const [correlations, setCorrelations] = useState([]);
    const [scatterData, setScatterData] = useState([]); // State for scatter data
    const [minCorrelation, setMinCorrelation] = useState(0.0);  // Track min correlation
    const [maxPValue, setMaxPValue] = useState(1.0);            // Track max p-value
    const [isModalOpen, setIsModalOpen] = useState(false);  // State for modal visibility

    // Function to open modal
    const openModal = () => setIsModalOpen(true);
    
    // Function to close modal
    const closeModal = () => setIsModalOpen(false);

    // When query form submitted, make POST request to correlations API
    const handleQuery = (query) => {
        console.log('Handling POST query to /correlations/...');
        console.log('Query:', query);

        // Update minCorrelation and maxPValue state
        setMinCorrelation(parseFloat(query.minCorrelation));
        setMaxPValue(parseFloat(query.maxPValue));

        // Make the POST request
        axios
            .post(`${process.env.REACT_APP_API_ROOT}correlations/`, {
                feature1: query.feature1,
                feature2: query.feature2,
                database1: query.database1,
                database2: query.database2
            })
            .then((response) => {
                console.log('Retrieved correlations:', response);
                setCorrelations(response.data.correlations);
            })
            .catch((err) => {
                console.error('Error fetching correlations:', err);
            });
    };

    // New function to handle scatter data request
    const handleScatterRequest = (feature1, feature2, database1, database2) => {
        const scatterData = {
            feature1,
            feature2,
            database1, 
            database2
        };

        console.log(scatterData)
        axios
            .post(`${process.env.REACT_APP_API_ROOT}scatter/`, scatterData)
            .then((response) => {
                console.log('Scatter data:', response.data.scatter_data);
                setScatterData(response.data.scatter_data); // Set scatter data
            })
            .catch((error) => {
                console.error('Error posting scatter data:', error);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <h1 className="bg-indigo-300 text-4xl text-bold py-3 text-center">Database Query Interface</h1>
            <div className="grid grid-cols-3 gap-6 p-6">
                {/* Left Column: QueryForm */}
                <div className="col-span-1 bg-white shadow-md rounded-lg p-4">
                    <QueryForm onSubmit={handleQuery} />
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Embedded PDF</h2>
                        <iframe 
                            src="/sample.pdf" 
                            className="w-full h-[500px] border border-gray-300 rounded-lg"
                            title="Sample PDF"
                        ></iframe>
                        {/* Button to open PDF in a popup */}
                        <button 
                            onClick={openModal} 
                            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                        >
                            View PDF in Popup
                        </button>
                    </div>
                </div>
    
                {/* Right Column: ScatterPlot, CorrelationResult, Graph */}
                <div className="col-span-2 bg-white shadow-md rounded-lg p-4">
                    <CorrelationResult 
                        data={correlations} 
                        minCorrelation={minCorrelation} 
                        maxPValue={maxPValue} 
                        onScatterRequest={handleScatterRequest} 
                    />
                    {scatterData.length > 0 && (
                        <ScatterPlot data={scatterData} />
                    )}
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