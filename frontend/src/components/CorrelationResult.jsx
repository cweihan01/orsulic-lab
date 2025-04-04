import React, { useState, useMemo } from 'react';
import axios from 'axios';
import depMapToCellLineID from '../cellline_mapping.js';

function CorrelationResult({ data, minCorrelation, maxPValue, onScatterRequest, highlightedRow }) {
    // Function to determine text color for correlation values
    const getCorrelationColor = (correlation) => {
        if (correlation > 0.75) return '#2e7d32';
        if (correlation > 0.5) return '#558b2f';
        if (correlation > 0.25) return '#f9a825';
        if (correlation > -0.25) return '#fbc02d';
        if (correlation > -0.5) return '#e64a19';
        return '#b71c1c';
    };

    // Function to determine text color for p-values
    const getPValueColor = (pValue) => {
        if (pValue < 0.01) return '#1565c0';
        if (pValue < 0.05) return '#0288d1';
        return '#9e9e9e';
    };

    // Download raw data for a given row
    const handleDownloadData = async (feature1, feature2, database1, database2) => {
        try {
            const payload = { feature1, feature2, database1, database2 };
            const response = await axios.post(process.env.REACT_APP_API_ROOT + 'scatter/', payload);
            const scatterData = response.data.scatter_data;

            const csvRows = [];
            if (scatterData.length === 0) {
                alert('No data returned from server!');
                return;
            }
            const headers = Object.keys(scatterData[0]);

            const newHeaders = [];
            headers.forEach(header => {
                if(header === 'cell_lines'){
                    newHeaders.push('DepMap ID');
                } else {
                    newHeaders.push(header);
                }
                if(header === 'cell_lines'){
                    newHeaders.push('Cell Line ID');
                }
            });
            csvRows.push(newHeaders.join(','));

            scatterData.forEach((obj) => {
                const row = [];
                headers.forEach(header => {
                    row.push(JSON.stringify(obj[header] ?? ''));
                    if(header === 'cell_lines'){
                        const depMapId = obj[header];
                        const actualCellLineID = depMapToCellLineID[depMapId] || '';
                        row.push(JSON.stringify(actualCellLineID));
                    }
                });
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${feature1}_vs_${feature2}_scatter.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error fetching scatter data for download:', err);
            alert('Failed to download data. See console for details.');
        }
    };

    // Filter data based on correlation and p-value
    const filteredData = data.filter(
        (item) => item.spearman_correlation >= minCorrelation && item.spearman_p_value <= maxPValue
    );

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: 'spearman_correlation',
        direction: 'descending',
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortArrow = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '';
    };

    // Use useMemo to recalc sortedData only when dependencies change
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aVal, bVal;
                switch (sortConfig.key) {
                    case 'database2':
                        aVal = a.database2.toLowerCase();
                        bVal = b.database2.toLowerCase();
                        break;
                    case 'feature2':
                        aVal = a.feature2.toLowerCase();
                        bVal = b.feature2.toLowerCase();
                        break;
                    case 'count':
                        aVal = a.count;
                        bVal = b.count;
                        break;
                    case 'spearman_correlation':
                        aVal = Math.abs(a.spearman_correlation);
                        bVal = Math.abs(b.spearman_correlation);
                        break;
                    case 'spearman_p_value':
                        aVal = a.spearman_p_value;
                        bVal = b.spearman_p_value;
                        break;
                    default:
                        return 0;
                }
                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    return (
        <div className="w-full rounded-lg drop-shadow-lg bg-white p-4 my-2 bg-gray-200 overflow-x-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Correlation Results</h2>
            {sortedData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="correlation-result w-full">
                        <thead>
                            <tr>
                                <th
                                    className="whitespace-nowrap"
                                    style={{ backgroundColor: '#6366f1' }}
                                >
                                    Database 1
                                </th>
                                <th
                                    className="whitespace-nowrap"
                                    style={{ backgroundColor: '#6366f1' }}
                                >
                                    Feature 1
                                </th>
                                <th
                                    className="whitespace-nowrap cursor-pointer"
                                    style={{ backgroundColor: '#6366f1' }}
                                    onClick={() => requestSort('database2')}
                                >
                                    Database 2{' '}
                                    <span className="ml-1">{getSortArrow('database2')}</span>
                                </th>
                                <th
                                    className="whitespace-nowrap cursor-pointer"
                                    style={{ backgroundColor: '#6366f1' }}
                                    onClick={() => requestSort('feature2')}
                                >
                                    Feature 2{' '}
                                    <span className="ml-1">{getSortArrow('feature2')}</span>
                                </th>
                                <th
                                    className="whitespace-nowrap cursor-pointer"
                                    style={{ backgroundColor: '#6366f1' }}
                                    onClick={() => requestSort('count')}
                                >
                                    Count <span className="ml-1">{getSortArrow('count')}</span>
                                </th>
                                <th
                                    className="whitespace-nowrap cursor-pointer"
                                    style={{ backgroundColor: '#6366f1' }}
                                    onClick={() => requestSort('spearman_correlation')}
                                >
                                    Spearman Correlation{' '}
                                    <span className="ml-1">
                                        {getSortArrow('spearman_correlation')}
                                    </span>
                                </th>
                                <th
                                    className="whitespace-nowrap cursor-pointer"
                                    style={{ backgroundColor: '#6366f1' }}
                                    onClick={() => requestSort('spearman_p_value')}
                                >
                                    Spearman P-Value{' '}
                                    <span className="ml-1">{getSortArrow('spearman_p_value')}</span>
                                </th>
                                <th
                                    className="whitespace-nowrap"
                                    style={{ backgroundColor: '#6366f1' }}
                                >
                                    Scatterplot Link
                                </th>
                                <th
                                    className="whitespace-nowrap"
                                    style={{ backgroundColor: '#6366f1' }}
                                >
                                    Download Data
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`${
                                        highlightedRow === item.feature2
                                            ? 'border-red-400 border-2'
                                            : ''
                                    }`}
                                >
                                    <td>{item.database1}</td>
                                    <td>{item.feature1}</td>
                                    <td>{item.database2}</td>
                                    <td>{item.feature2}</td>
                                    <td>{item.count}</td>
                                    <td
                                        style={{
                                            color: getCorrelationColor(item.spearman_correlation),
                                        }}
                                    >
                                        {item.spearman_correlation}
                                    </td>
                                    <td style={{ color: getPValueColor(item.spearman_p_value) }}>
                                        {item.spearman_p_value}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                onScatterRequest(
                                                    item.feature1,
                                                    item.feature2,
                                                    item.database1,
                                                    item.database2
                                                )
                                            }
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Scatterplot
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                handleDownloadData(
                                                    item.feature1,
                                                    item.feature2,
                                                    item.database1,
                                                    item.database2
                                                )
                                            }
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
