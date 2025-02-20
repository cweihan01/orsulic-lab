import React from 'react';

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

    // Filter and sort data
    const filteredData = data
        .filter(
            (item) => 
                item.spearman_correlation >= minCorrelation &&
                item.spearman_p_value <= maxPValue
        )
        .sort((a, b) => a.spearman_p_value - b.spearman_p_value); // Sort by p-value

    return (
        <div className="max-w-4xl mx-auto rounded-lg drop-shadow-lg bg-white p-6 my-4 bg-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Correlation Results</h2>
            {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="correlation-result w-full">
                        <thead>
                            <tr>
                                <th>Database 1</th>
                                <th>Feature 1</th>
                                <th>Database 2</th>
                                <th>Feature 2</th>
                                <th>Count</th>
                                <th>Spearman Correlation</th>
                                <th>Spearman P-Value</th>
                                <th>Scatterplot Link</th>
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
                                            Get Scatter Data
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

