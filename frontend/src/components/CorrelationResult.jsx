import React, { useState, useMemo } from 'react';
import axios from 'axios';
import depMapToCellLineID from '../cellline_mapping.js';

function CorrelationResult({
    data,
    minCorrelation,
    maxPValue,
    onScatterRequest,
    highlightedRow,
    onRequery
}) {
    // 1) find the real metric columns in your data
    const { correlationKey, pValueKey } = useMemo(() => {
        if (!data || data.length === 0) {
            return { correlationKey: null, pValueKey: null };
        }
        const cols = Object.keys(data[0]);
        // correlation only exists for spearman
        const correlationKey = cols.find(k => k.endsWith('_correlation'));
        // p-value can be spearman_pvalue or anova_pvalue or chisq_pvalue
        const pValueKey =
            cols.find(k => k.toLowerCase().endsWith('pvalue')) || null;
        return { correlationKey, pValueKey };
    }, [data]);

    // 2) color helpers
    const getCorrelationColor = c => {
        if (c > 0.75) return '#2e7d32';
        if (c > 0.5) return '#558b2f';
        if (c > 0.25) return '#f9a825';
        if (c > -0.25) return '#fbc02d';
        if (c > -0.5) return '#e64a19';
        return '#b71c1c';
    };
    const getPValueColor = p => {
        if (p < 0.01) return '#1565c0';
        if (p < 0.05) return '#0288d1';
        return '#9e9e9e';
    };

    // 3) your original download-scatter handler (verbatim)
    //      TODO: I want to change these variable names to category1, category2, but it breaks this function
    const handleDownloadData = async (feature1, feature2, database1, database2) => {
        try {
            const payload = { feature1, feature2, database1, database2 };
            const response = await axios.post(
                process.env.REACT_APP_API_ROOT + 'scatter/',
                payload
            );
            const scatterData = response.data.scatter_data;
            if (scatterData.length === 0) {
                alert('No data returned from server!');
                return;
            }
            const csvRows = [];
            const headers = Object.keys(scatterData[0]);
            const newHeaders = [];
            headers.forEach(header => {
                if (header === 'cell_lines') {
                    newHeaders.push('DepMap ID');
                }
                newHeaders.push(header);
                if (header === 'cell_lines') {
                    newHeaders.push('Cell Line ID');
                }
            });
            csvRows.push(newHeaders.join(','));
            scatterData.forEach(obj => {
                const row = [];
                headers.forEach(header => {
                    row.push(JSON.stringify(obj[header] ?? ''));
                    if (header === 'cell_lines') {
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

    // 4) your original download-table handler (verbatim)
    const handleDownloadTable = () => {
        if (sortedData.length === 0) {
            alert('No results to download.');
            return;
        }
        const headers = Object.keys(sortedData[0]);
        const csvRows = [headers.join(',')];
        sortedData.forEach(row => {
            const values = headers.map(h => JSON.stringify(row[h] ?? ''));
            csvRows.push(values.join(','));
        });
        const feature1 = sortedData[0]?.feature1 || 'correlation';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${feature1}_correlation_results_${timestamp}.csv`;
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // 5) filter rows by thresholds; if no correlationKey, just use pValue
    const filteredData = useMemo(() => {
        if (!pValueKey) return [];
        return data.filter(item => {
            const p = item[pValueKey];
            const c = correlationKey ? item[correlationKey] : null;
            const passCorr = correlationKey
                ? Math.abs(c) >= minCorrelation
                : true;
            return passCorr && p <= maxPValue;
        });
    }, [data, correlationKey, pValueKey, minCorrelation, maxPValue]);

    // 6) sorting
    const defaultKey = correlationKey || pValueKey || 'count';
    const [sortConfig, setSortConfig] = useState({
        key: defaultKey,
        direction: 'descending'
    });
    const requestSort = key => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    const getSortArrow = key =>
        sortConfig.key === key
            ? sortConfig.direction === 'ascending'
                ? '▲'
                : '▼'
            : '';

    const sortedData = useMemo(() => {
        const items = [...filteredData];
        items.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'ascending'
                    ? aVal - bVal
                    : bVal - aVal;
            }
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return items;
    }, [filteredData, sortConfig]);

    // 7) render
    return (
        <div className="w-full rounded-lg drop-shadow-lg bg-white p-4 my-2 bg-gray-200 overflow-x-auto">
            <h2
                className="text-3xl font-semibold text-gray-800 mb-4"
                style={{ fontFamily: 'Futura' }}
            >
                Correlation Results
            </h2>

            {sortedData.length > 0 ? (
                <>
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={handleDownloadTable}
                            style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                            className="text-white px-4 py-2 rounded hover:opacity-85"
                        >
                            Download Table as CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="correlation-result w-full">
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#78aee8' }}>Category 1</th>
                                    <th style={{ backgroundColor: '#78aee8' }}>Feature 1</th>
                                    <th
                                        className="cursor-pointer"
                                        style={{ backgroundColor: '#78aee8' }}
                                        onClick={() => requestSort('category2')}
                                    >
                                        Category 2 {getSortArrow('category2')}
                                    </th>
                                    <th
                                        className="cursor-pointer"
                                        style={{ backgroundColor: '#78aee8' }}
                                        onClick={() => requestSort('feature2')}
                                    >
                                        Feature 2 {getSortArrow('feature2')}
                                    </th>
                                    <th
                                        className="cursor-pointer"
                                        style={{ backgroundColor: '#78aee8' }}
                                        onClick={() => requestSort('count')}
                                    >
                                        Count {getSortArrow('count')}
                                    </th>

                                    {/* correlation column only if present */}
                                    {correlationKey && (
                                        <th
                                            className="cursor-pointer"
                                            style={{ backgroundColor: '#78aee8' }}
                                            onClick={() => requestSort(correlationKey)}
                                        >
                                            {correlationKey.replace(/_/g, ' ')}{' '}
                                            {getSortArrow(correlationKey)}
                                        </th>
                                    )}

                                    {/* always show the p-value column */}
                                    <th
                                        className="cursor-pointer"
                                        style={{ backgroundColor: '#78aee8' }}
                                        onClick={() => requestSort(pValueKey)}
                                    >
                                        {pValueKey.replace(/_/g, ' ')} {getSortArrow(pValueKey)}
                                    </th>

                                    <th style={{ backgroundColor: '#78aee8' }}>
                                        Scatterplot Link
                                    </th>
                                    <th style={{ backgroundColor: '#78aee8' }}>
                                        Download Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            highlightedRow === item.feature2
                                                ? 'border-red-400 border-2'
                                                : ''
                                        }
                                    >
                                        <td>{item.database_1}</td>
                                        <td>{item.feature_1}</td>
                                        <td>{item.database_2}</td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    onRequery(item.feature_2, item.database_2)
                                                }
                                                className="text-blue-600 font-semibold hover:underline"
                                            >
                                                {item.feature_2}
                                            </button>
                                        </td>
                                        <td>{item.count}</td>

                                        {correlationKey && (
                                            <td
                                                style={{
                                                    color: getCorrelationColor(item[correlationKey])
                                                }}
                                            >
                                                {item[correlationKey]}
                                            </td>
                                        )}
                                        <td
                                            style={{
                                                color: getPValueColor(item[pValueKey])
                                            }}
                                        >
                                            {item[pValueKey]}
                                        </td>

                                        <td>
                                            <button
                                                 onClick={() =>
                                                    onScatterRequest(
                                                      item.feature_1,
                                                      item.feature_2,
                                                      item.database_1,
                                                      item.database_2,
                                                      pValueKey.includes('anova') ? 'anova' : pValueKey.includes('chisq') ? 'chisq' : 'spearman'
                                                    )
                                                }
                                                className="text-blue-500 hover:underline"
                                            > 
                                                {pValueKey.includes('anova') ? 'View Boxplot' : pValueKey.includes('chisq') ? 'View Barplot' : 'View Scatterplot'}
                                            </button>   
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleDownloadData(
                                                        item.feature_1,
                                                        item.feature_2,
                                                        item.database_1,
                                                        item.database_2
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
                </>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default CorrelationResult;
