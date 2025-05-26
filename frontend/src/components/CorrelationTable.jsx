import React, { useState, useMemo, useEffect } from 'react';

import axios from 'axios';
import {
    DEPMAP_TO_CELLLINE_ID,
    TAB_DISPLAY_NAMES,
    RESULTS_INCREMENT,
    TAB_TYPES,
} from '../utils/constants.js';

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

/** Format number to 3 s.f. and scientific notation if necessary */
const formatNumber = (n) => {
    if (typeof n !== 'number' || Number.isNaN(n)) return n;
    const abs = Math.abs(n);
    // Scientific notation if <0.001 or >=1000
    if ((abs !== 0 && abs < 0.001) || abs >= 1000) {
        return n.toExponential(3);
    }
    return n.toPrecision(3);
};

/** Download a single row of data as a csv file */
const handleDownloadRowData = async (
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
        const includeCellLineID = headers.includes('cell_lines');

        // Reorder headers so Cell Line ID comes right after 'cell_lines'
        let headerRow = [];
        headers.forEach((header) => {
            headerRow.push(header);
            if (header === 'cell_lines') {
                headerRow.push('Cell Line ID'); // insert Cell Line ID immediately after cell_lines
            }
        });
        csvRows.push(headerRow.join(','));

        // Fill in rows accordingly
        scatterData.forEach((obj) => {
            const row = [];
            headers.forEach((header) => {
                const val = obj[header] ?? '';
                row.push(JSON.stringify(val));
                if (header === 'cell_lines') {
                    const cellID = DEPMAP_TO_CELLLINE_ID[val] || '';
                    row.push(JSON.stringify(cellID));
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

/** Top header row component of table */
const TableHeaderRow = ({
    sortConfig,
    setSortConfig,
    correlationKey,
    pValueKey,
    selectedTab,
}) => {
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

    return (
        <tr>
            <th style={{ backgroundColor: '#78aee8' }}>Subcategory 1</th>
            <th style={{ backgroundColor: '#78aee8' }}>Feature 1</th>
            <th
                className="cursor-pointer"
                style={{ backgroundColor: '#78aee8' }}
                onClick={() => requestSort('subcategory_2')}
            >
                Subcategory 2 {getSortArrow('subcategory_2')}
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
                    {TAB_DISPLAY_NAMES[selectedTab]} Correlation
                    {getSortArrow(correlationKey)}
                </th>
            )}
            <th
                className="cursor-pointer"
                style={{ backgroundColor: '#78aee8' }}
                onClick={() => requestSort(pValueKey)}
            >
                {TAB_DISPLAY_NAMES[selectedTab]} P-value
                {getSortArrow(pValueKey)}
            </th>
            <th style={{ backgroundColor: '#78aee8' }}>Plot Link</th>
            <th style={{ backgroundColor: '#78aee8' }}>Download Data</th>
        </tr>
    );
};

/** Body row component of table with a single feature against another feature */
const TableBodyRow = ({
    idx,
    item,
    highlightedRow,
    correlationKey,
    pValueKey,
    selectedTab,
    onScatterRequest,
    onRequery,
}) => {
    return (
        <tr
            key={idx}
            className={
                highlightedRow === item.feature_2
                    ? 'border-red-400 border-2'
                    : ''
            }
        >
            <td>{item.subcategory_1}</td>
            <td>{item.feature_1}</td>
            <td>{item.subcategory_2}</td>
            <td>
                <button
                    onClick={() => onRequery(item.feature_2, item.database_2)}
                    className="text-blue-600 font-semibold hover:underline"
                >
                    {item.feature_2}
                </button>
            </td>
            <td>{item.count}</td>
            {correlationKey && (
                <td
                    style={{
                        color: getCorrelationColor(item[correlationKey]),
                    }}
                >
                    {formatNumber(item[correlationKey])}
                </td>
            )}
            <td
                style={{
                    color: getPValueColor(item[pValueKey]),
                }}
            >
                {formatNumber(item[pValueKey])}
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
                    {selectedTab === TAB_TYPES.ANOVA
                        ? 'View Boxplot'
                        : selectedTab === TAB_TYPES.CHISQUARED
                        ? 'View Barplot'
                        : 'View Scatterplot'}
                </button>
            </td>
            <td>
                <button
                    onClick={() =>
                        handleDownloadRowData(
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
    );
};

export default function CorrelationTable({
    sortedData,
    correlationKey,
    pValueKey,
    highlightedRow,
    onRequery,
    onScatterRequest,
    selectedTab,
    sortConfig,
    setSortConfig,
    onScrollToTop,
}) {
    // Store the number of rows that are being displayed currently
    const [visibleCount, setVisibleCount] = useState(RESULTS_INCREMENT);

    // Subset of all data that is being displayed
    const visibleData = useMemo(
        () => sortedData.slice(0, visibleCount),
        [sortedData, visibleCount]
    );

    // Set sorted column
    useEffect(() => {
        if (!pValueKey && !correlationKey) return;

        const defaultKey = correlationKey || pValueKey || 'count';
        const defaultDirection = correlationKey ? 'descending' : 'ascending';

        setSortConfig({ key: defaultKey, direction: defaultDirection });
    }, [correlationKey, pValueKey]);

    useEffect(() => {
        setVisibleCount(RESULTS_INCREMENT);
    }, [sortedData]);

    return (
        <>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="correlation-result w-full">
                    <thead>
                        <TableHeaderRow
                            sortConfig={sortConfig}
                            setSortConfig={setSortConfig}
                            correlationKey={correlationKey}
                            pValueKey={pValueKey}
                            selectedTab={selectedTab}
                        />
                    </thead>
                    <tbody>
                        {visibleData.map((item, idx) => (
                            <TableBodyRow
                                idx={idx}
                                item={item}
                                highlightedRow={highlightedRow}
                                correlationKey={correlationKey}
                                pValueKey={pValueKey}
                                selectedTab={selectedTab}
                                onScatterRequest={onScatterRequest}
                                onRequery={onRequery}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer of table */}
            {visibleCount < sortedData.length && (
                <div className="flex items-center mt-4">
                    {/* Button to scroll back to top of results container */}
                    <div className="flex-1">
                        <button
                            onClick={onScrollToTop}
                            className="text-sm p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Back to Top
                        </button>
                    </div>

                    {/* Button to load more rows */}
                    <div>
                        <button
                            onClick={() =>
                                setVisibleCount((v) => v + RESULTS_INCREMENT)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Load More
                        </button>
                    </div>

                    {/* Number of rows displayed */}
                    <div className="flex-1 text-right">
                        <span className="text-gray-600 text-sm">
                            Showing {Math.min(visibleCount, sortedData.length)}{' '}
                            of {sortedData.length} rows
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}
