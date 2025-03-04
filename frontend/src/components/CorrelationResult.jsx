import React from 'react';
import axios from 'axios';

function CorrelationResult({ data, minCorrelation, maxPValue, onScatterRequest }) {
    // Function to determine text color for correlation values
    const getCorrelationColor = (correlation) => {
        if (correlation > 0.75) return '#2e7d32'; // Dark green for strong positive correlation
        if (correlation > 0.5) return '#558b2f'; // Green for moderate positive correlation
        if (correlation > 0.25) return '#f9a825'; // Yellow for weak positive correlation
        if (correlation > -0.25) return '#fbc02d'; // Orange for neutral correlation
        if (correlation > -0.5) return '#e64a19'; // Light red for weak negative correlation
        return '#b71c1c'; // Dark red for strong negative correlation
    };

    // Function to determine text color for p-values
    const getPValueColor = (pValue) => {
        if (pValue < 0.01) return '#1565c0'; // Blue for very significant p-value
        if (pValue < 0.05) return '#0288d1'; // Light blue for significant p-value
        return '#9e9e9e'; // Gray for non-significant p-value
    };

// Button to download raw data, correlations only
const handleDownloadData = async (feature1, feature2, database1, database2) => {
    try {
        const payload = {
            feature1, feature2, database1, database2
        };
        const response = await axios.post(
            process.env.REACT_APP_API_ROOT + 'scatter/',
            payload
        );
        const scatterData = response.data.scatter_data;

        // Building csv file
        const csvRows = [];
        if (scatterData.length === 0) {
            alert("No data returned from server!");
            return;
        }
        
        // Extract headers from keys, add rows/map values
        const headers = Object.keys(scatterData[0]);
        csvRows.push(headers.join(','));
        scatterData.forEach(obj => {
            const row = headers.map(h => JSON.stringify(obj[h] ?? ""));
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${feature1}_vs_${feature2}_scatter.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        } catch (err) {
        console.error("Error fetching scatter data for download:", err);
        alert("Failed to download data. See console for details.");
    }
};

    // Filter and sort data
    const filteredData = data
        .filter(
            (item) => 
                item.spearman_correlation >= minCorrelation &&
                item.spearman_p_value <= maxPValue
        )
        .sort((a, b) => a.spearman_p_value - b.spearman_p_value); // Sort by p-value

    return (
        <div className="w-full rounded-lg drop-shadow-lg bg-white p-6 my-4 bg-gray-200 overflow-x-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Correlation Results</h2>
            {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="correlation-result w-full">
                        <thead>
                            <tr>
                                <th style={{ backgroundColor: '#6366f1'}}>Database 1</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Feature 1</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Database 2</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Feature 2</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Count</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Spearman Correlation</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Spearman P-Value</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Scatterplot Link</th>
                                <th style={{ backgroundColor: '#6366f1'}}>Download Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.database1}</td>
                                    <td>{item.feature1}</td>
                                    <td>{item.database2}</td>
                                    <td>{item.feature2}</td>
                                    <td>{item.count}</td>
                                    <td style={{ color: getCorrelationColor(item.spearman_correlation) }}>
                                        {item.spearman_correlation}
                                    </td>
                                    <td style={{ color: getPValueColor(item.spearman_p_value) }}>
                                        {item.spearman_p_value}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => onScatterRequest(item.feature1, item.feature2, item.database1, item.database2)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Scatterplot
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDownloadData(item.feature1, item.feature2, item.database1, item.database2)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Download Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default CorrelationResult;

