import React, { useState, useMemo, useEffect } from 'react';

import depMapToCellLineID from '../cellline_mapping.js';
import axios from 'axios';

// Number of results in table to display at once
const RESULTS_INCREMENT = 100;

const getCorrelationColor = (c) => {
    if (c > 0.75) return '#2e7d32';
    if (c > 0.5) return '#558b2f';
    if (c > 0.25) return '#f9a825';
    if (c > -0.25) return '#fbc02d';
    if (c > -0.5) return '#e64a19';
    return '#b71c1c';
};

const getPValueColor = (p) => {
    if (p < 0.01) return '#1565c0';
    if (p < 0.05) return '#0288d1';
    return '#9e9e9e';
};

export default function CorrelationTable({
    filteredData,
    correlationKey,
    pValueKey,
    highlightedRow,
    onRequery,
    onScatterRequest,
    selectedTab,
}) {
    // Store the number of rows that are being displayed currently
    const [visibleCount, setVisibleCount] = useState(RESULTS_INCREMENT);

    // Store sorted column state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending',
    });

    // Set sorted column
    useEffect(() => {
        if (!pValueKey && !correlationKey) return;

        const defaultKey = correlationKey || pValueKey || 'count';
        const defaultDirection = correlationKey ? 'descending' : 'ascending';

        setSortConfig({ key: defaultKey, direction: defaultDirection });
    }, [correlationKey, pValueKey]);

    /** Sort by new key/column */
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    /** Display arrow if this column is being sorted */
    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    /** Perform sort based on key */
    const sortedData = useMemo(() => {
        const items = [...filteredData];
        items.sort((a, b) => {
            let aVal = a[sortConfig.key],
                bVal = b[sortConfig.key];

            // Special case: sort Spearman correlation by absolute value
            if (sortConfig.key === correlationKey && typeof aVal === 'number') {
                aVal = Math.abs(aVal);
                bVal = Math.abs(bVal);
            }

            // Sort numerical values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'ascending'
                    ? aVal - bVal
                    : bVal - aVal;
            }

            // Sort everything else as strings
            const aStr = String(aVal).toLowerCase(),
                bStr = String(bVal).toLowerCase();
            if (aStr < bStr)
                return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aStr > bStr)
                return sortConfig.direction === 'ascending' ? 1 : -1;

            return 0;
        });
        return items;
    }, [filteredData, sortConfig, correlationKey]);

    // Subset of all data that is being displayed
    const visibleData = useMemo(
        () => sortedData.slice(0, visibleCount),
        [sortedData, visibleCount]
    );

    /** Download the entire table as a csv file */
    const handleDownloadTable = () => {
        if (sortedData.length === 0) {
            alert('No results to download.');
            return;
        }

        const headers = Object.keys(sortedData[0]);
        const csvRows = [headers.join(',')];

        sortedData.forEach((row) => {
            const values = headers.map((h) => JSON.stringify(row[h] ?? ''));
            csvRows.push(values.join(','));
        });

        const feature1 = sortedData[0]?.feature_1 || 'results';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${feature1}_${selectedTab}_results_${timestamp}.csv`;

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    /** Download a single row of data as a csv file */
    const handleDownloadData = async (
        feature1,
        feature2,
        database1,
        database2,
        plotType
    ) => {
        try {
            const payload = {
                feature1,
                feature2,
                database1,
                database2,
                plotType,
            };
            const response = await axios.post(
                process.env.REACT_APP_API_ROOT + 'scatter/',
                payload
            );

            const scatterData = response.data.scatter_data;
            if (!scatterData || scatterData.length === 0) {
                alert('No data returned from server!');
                return;
            }

            const csvRows = [];
            const headers = Object.keys(scatterData[0]);
            const isSpearman = plotType === 'spearman';

            let headerRow;
            if (isSpearman && headers.includes('cell_lines')) {
                headerRow = headers.flatMap((header) =>
                    header === 'cell_lines'
                        ? ['DepMap ID', header, 'Cell Line ID']
                        : [header]
                );
            } else {
                headerRow = headers;
            }
            csvRows.push(headerRow.join(','));

            scatterData.forEach((obj) => {
                const row = [];
                headers.forEach((header) => {
                    const val = obj[header] ?? '';
                    if (isSpearman && header === 'cell_lines') {
                        const depMapId = val;
                        const actualCellLineID =
                            depMapToCellLineID[depMapId] || '';
                        row.push(JSON.stringify(depMapId));
                        row.push(JSON.stringify(val));
                        row.push(JSON.stringify(actualCellLineID));
                    } else {
                        row.push(JSON.stringify(val));
                    }
                });
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${feature1}_vs_${feature2}_${plotType}_data_${timestamp}.csv`;

            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error fetching scatter data for download:', err);
            alert('Failed to download data. See console for details.');
        }
    };

    return (
        <>
            <div className="flex justify-end mb-2">
                <button
                    onClick={handleDownloadTable}
                    style={{
                        backgroundColor: '#78aee8',
                        fontFamily: 'Futura',
                    }}
                    className="text-white px-4 py-2 rounded hover:opacity-85"
                >
                    Download Table as CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="correlation-result w-full">
                    <thead>
                        <tr>
                            <th style={{ backgroundColor: '#78aee8' }}>
                                Category 1
                            </th>
                            <th style={{ backgroundColor: '#78aee8' }}>
                                Feature 1
                            </th>
                            <th
                                className="cursor-pointer"
                                style={{ backgroundColor: '#78aee8' }}
                                onClick={() => requestSort('database_2')}
                            >
                                Category 2 {getSortArrow('database_2')}
                            </th>
                            <th
                                className="cursor-pointer"
                                style={{ backgroundColor: '#78aee8' }}
                                onClick={() => requestSort('feature_2')}
                            >
                                Feature 2 {getSortArrow('feature_2')}
                            </th>
                            <th
                                className="cursor-pointer"
                                style={{ backgroundColor: '#78aee8' }}
                                onClick={() => requestSort('count')}
                            >
                                Count {getSortArrow('count')}
                            </th>
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
                            <th
                                className="cursor-pointer"
                                style={{ backgroundColor: '#78aee8' }}
                                onClick={() => requestSort(pValueKey)}
                            >
                                {pValueKey.replace(/_/g, ' ')}{' '}
                                {getSortArrow(pValueKey)}
                            </th>
                            <th style={{ backgroundColor: '#78aee8' }}>
                                Plot Link
                            </th>
                            <th style={{ backgroundColor: '#78aee8' }}>
                                Download Data
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleData.map((item, idx) => (
                            <tr
                                key={idx}
                                className={
                                    highlightedRow === item.feature_2
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
                                            onRequery(
                                                item.feature_2,
                                                item.database_2
                                            )
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
                                            color: getCorrelationColor(
                                                item[correlationKey]
                                            ),
                                        }}
                                    >
                                        {item[correlationKey]}
                                    </td>
                                )}
                                <td
                                    style={{
                                        color: getPValueColor(item[pValueKey]),
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
                                                selectedTab
                                            )
                                        }
                                        className="text-blue-500 hover:underline"
                                    >
                                        {selectedTab === 'anova'
                                            ? 'View Boxplot'
                                            : selectedTab === 'chisq'
                                            ? 'View Barplot'
                                            : 'View Scatterplot'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleDownloadData(
                                                item.feature_1,
                                                item.feature_2,
                                                item.database_1,
                                                item.database_2,
                                                selectedTab
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

                {visibleCount < sortedData.length && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() =>
                                setVisibleCount((v) => v + RESULTS_INCREMENT)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
