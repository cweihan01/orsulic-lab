// App.jsx
import React, { useState } from 'react';
import QueryForm from './components/QueryForm';
import CorrelationResult from './components/CorrelationResult';
import { mockCorrelationData } from './components/MockData';
import './App.css'; // Importing App.css for styling

function App() {
    const [data, setData] = useState([]);

    const handleQuery = (query) => {
        const filteredData = mockCorrelationData.filter((item) => {
            const meetsFeature1 = query.feature1
                ? item.feature_1_name.toLowerCase().includes(query.feature1.toLowerCase())
                : true;
            const meetsFeature2 = query.feature2
                ? item.feature_2_name.toLowerCase().includes(query.feature2.toLowerCase())
                : true;
            const meetsCorrelation = query.minCorrelation
                ? item.spearman_correlation >= parseFloat(query.minCorrelation)
                : true;
            const meetsPValue = query.maxPValue
                ? item.spearman_p_value <= parseFloat(query.maxPValue)
                : true;

            return meetsFeature1 && meetsFeature2 && meetsCorrelation && meetsPValue;
        });

        // Sort results by Spearman P-Value in ascending order
        const sortedData = filteredData.sort((a, b) => a.spearman_p_value - b.spearman_p_value);

        setData(sortedData);
    };

    return (
        <div className="App">
            <h1 className="App-header">Database Query Interface</h1>
            <QueryForm onSubmit={handleQuery} />
            <CorrelationResult data={data} />
        </div>
    );
}

export default App;
