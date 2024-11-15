// CorrelationResult.js
import React from 'react';

function CorrelationResult({ data }) {
    return (
        <div className="correlation-result">
            <h2>Correlation Results</h2>
            {data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Feature 1</th>
                            <th>Feature 2</th>
                            <th>Count</th>
                            <th>Spearman Correlation</th>
                            <th>Spearman P-Value</th>
                            <th>FDR-Adjusted P-Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.feature_1_name}</td>
                                <td>{item.feature_2_name}</td>
                                <td>{item.count}</td>
                                <td>{item.spearman_correlation}</td>
                                <td>{item.spearman_p_value}</td>
                                <td>{item.fdr_adjusted_p_value}</td>
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
