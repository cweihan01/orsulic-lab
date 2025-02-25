import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import CorrelationResult from "./components/CorrelationResult";
import ScatterPlot from "./components/ScatterPlot"; // Import ScatterPlot component
import Graph from "./components/Graph"; // Import Graph component
import axios from "axios";
import "./App.css";
import './index.js';

function App() {
    const [correlations, setCorrelations] = useState([]);
    const [scatterData, setScatterData] = useState([]); // State for scatter data
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
        <div className="text-center content-center">
            <h1 className="bg-indigo-300 text-4xl text-bold py-3">Database Query Interface</h1>
            <QueryForm onSubmit={handleQuery} />
            {scatterData.length > 0 && <ScatterPlot data={scatterData} />} {/* Render the scatter plot only if data is available */}
            <CorrelationResult 
                data={correlations} 
                minCorrelation={minCorrelation} 
                maxPValue={maxPValue} 
                onScatterRequest={handleScatterRequest} // Pass the function here
            />
            <Graph data={correlations} /> {/* Render the chart */}
        </div>
    );
}

export default App;
