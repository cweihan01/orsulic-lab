// App.jsx
import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import CorrelationResult from "./components/CorrelationResult";
import Graph from "./components/Graph"; // Import Graph component
import axios from "axios";
// import { mockCorrelationData } from './components/MockData';
import "./App.css"; // Importing App.css for styling
import './index.js';

function App() {
    const [correlations, setCorrelations] = useState([]);

    // When query form submitted, make POST request to correlations API
    const handleQuery = (query) => {
        console.log('Handling POST query to /correlations/...');
        // console.log('Query as from App.jsx:');
        console.log(query);

        // TODO: add p-value, correlation fields (need to be handled by backend)
        axios
            .post(`${process.env.REACT_APP_API_ROOT}correlations/`, {
                feature1: query.feature1,
                feature2: query.feature2,
            })
            .then((response) => {
                console.log('Retrieved correlations:');
                console.log(response);
                setCorrelations(response.data.correlations);
            })
            .catch((err) => {
                console.error(err);
            });

        // const filteredData = mockCorrelationData.filter((item) => {
        //     const meetsFeature1 = query.feature1
        //         ? item.feature_1_name.toLowerCase().includes(query.feature1.toLowerCase())
        //         : true;
        //     const meetsFeature2 = query.feature2
        //         ? item.feature_2_name.toLowerCase().includes(query.feature2.toLowerCase())
        //         : true;
        //     const meetsCorrelation = query.minCorrelation
        //         ? item.spearman_correlation >= parseFloat(query.minCorrelation)
        //         : true;
        //     const meetsPValue = query.maxPValue
        //         ? item.spearman_p_value <= parseFloat(query.maxPValue)
        //         : true;

        //     return meetsFeature1 && meetsFeature2 && meetsCorrelation && meetsPValue;
        // });

        // // Sort results by Spearman P-Value in ascending order
        // const sortedData = filteredData.sort((a, b) => a.spearman_p_value - b.spearman_p_value);

        // setData(sortedData);
    };

    return (
        <div className="text-center content-center">
            <h1 className="bg-indigo-300 text-4xl text-bold py-3">Database Query Interface</h1>
            <QueryForm onSubmit={handleQuery} />
            <CorrelationResult data={correlations} />
            <Graph data={correlations} /> {/* Render the chart */}
        </div>
    );
}

export default App;
