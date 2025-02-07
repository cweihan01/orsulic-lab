import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import CorrelationResult from "./components/CorrelationResult";
import Graph from "./components/Graph"; // Import Graph component
import axios from "axios";
import "./App.css";
import './index.js';

function App() {
    const [correlations, setCorrelations] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);  // Track min correlation
    const [maxPValue, setMaxPValue] = useState(1.0);            // Track max p-value

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
            })
            .then((response) => {
                console.log('Retrieved correlations:', response);
                setCorrelations(response.data.correlations);
            })
            .catch((err) => {
                console.error('Error fetching correlations:', err);
            });
    };

    return (
        <div className="text-center content-center">
            <h1 className="bg-indigo-300 text-4xl text-bold py-3">Database Query Interface</h1>
            <QueryForm onSubmit={handleQuery} />
            <CorrelationResult 
                data={correlations} 
                minCorrelation={minCorrelation} 
                maxPValue={maxPValue} 
            />
            <Graph data={correlations} /> {/* Render the chart */}

        </div>
    );
}

export default App;
