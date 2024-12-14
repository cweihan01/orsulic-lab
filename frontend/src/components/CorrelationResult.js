// CorrelationResult.js
import React from 'react';

function CorrelationResult({ data }) {
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

    // Sort data by Spearman p-value in ascending order
    const sortedData = [...data].sort((a, b) => a.spearman_p_value - b.spearman_p_value);

    return (
        <div className="correlation-result">
            <h2>Correlation Results</h2>
            {sortedData.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Feature 1</th>
                            <th>Feature 2</th>
                            <th>Count</th>
                            <th>Spearman Correlation</th>
                            <th>Spearman P-Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.feature_1_name}</td>
                                <td>{item.feature_2_name}</td>
                                <td>{item.count}</td>
                                <td style={{ color: getCorrelationColor(item.spearman_correlation) }}>
                                    {item.spearman_correlation}
                                </td>
                                <td style={{ color: getPValueColor(item.spearman_p_value) }}>
                                    {item.spearman_p_value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default CorrelationResult;

