import React, { useState, useMemo, useEffect } from 'react';
import CorrelationTable from './CorrelationTable.jsx';
import { TAB_KEYS, TAB_DISPLAY_NAMES } from '../utils/constants.js';

import './CorrelationResult.css';

const DownloadTableButton = ({ data, tab }) => {
    if (data.length === 0) return null;

    /** Download the entire table as a csv file, based on current sort */
    const handleDownloadTable = () => {
        if (data.length === 0) {
            alert('No results to download.');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        data.forEach((row) => {
            const values = headers.map((h) => JSON.stringify(row[h] ?? ''));
            csvRows.push(values.join(','));
        });

        const feature1 = data[0]?.feature_1 || 'results';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${feature1}_${tab}_results_${timestamp}.csv`;

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    };
    return (
        <button
            onClick={handleDownloadTable}
            style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
            className="text-white px-4 py-2 rounded hover:opacity-85"
        >
            Download Table as CSV
        </button>
    );
};

function CorrelationResult({
    correlationsMap,
    minCorrelation,
    maxPValue,
    onScatterRequest,
    highlightedRow,
    onRequery,
    onScrollToTop
}) {
    const [selectedTab, setSelectedTab] = useState('spearman');

    const data = correlationsMap[selectedTab] || [];

    useEffect(() => {
        const firstNonEmpty = TAB_KEYS.find(
            (key) =>
                Array.isArray(correlationsMap[key]) &&
                correlationsMap[key].length > 0
        );
        setSelectedTab(firstNonEmpty || 'spearman');
    }, [correlationsMap]);

    const { correlationKey, pValueKey } = useMemo(() => {
        if (!data || data.length === 0) {
            return { correlationKey: null, pValueKey: null };
        }
        const cols = Object.keys(data[0]);
        const correlationKey = cols.find((k) => k.endsWith('_correlation'));
        const pValueKey =
            cols.find((k) => k.toLowerCase().endsWith('pvalue')) || null;
        return { correlationKey, pValueKey };
    }, [data]);

    // Filter rows by thresholds; if no correlationKey, just use pValue
    const filteredData = useMemo(() => {
        if (!pValueKey) return [];
        return data.filter((item) => {
            const p = item[pValueKey];
            const c = correlationKey ? item[correlationKey] : null;
            const passCorr = correlationKey
                ? Math.abs(c) >= minCorrelation
                : true;
            return passCorr && p <= maxPValue;
        });
    }, [data, correlationKey, pValueKey, minCorrelation, maxPValue]);

    // Store sorted column state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending',
    });

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

    return (
        <div className="w-full rounded-lg drop-shadow-lg bg-white p-4 bg-gray-200 overflow-x-auto min-h-full">
            <div className="flex justify-between items-center mb-4">
                {/* Results tab title */}
                <h2
                    className="text-3xl font-semibold text-gray-800"
                    style={{ fontFamily: 'Futura' }}
                >
                    {TAB_DISPLAY_NAMES[selectedTab]} Correlation Results
                </h2>

                {/* Download table button */}
                {sortedData.length > 0 && (
                    <DownloadTableButton data={sortedData} tab={selectedTab} />
                )}
            </div>

            {/* Tab selector */}
            <div className="tab-buttons-container">
                {TAB_KEYS.map((key) => (
                    <button
                        key={key}
                        onClick={() => setSelectedTab(key)}
                        className={`tab-button ${
                            selectedTab === key ? 'active' : ''
                        }`}
                    >
                        {TAB_DISPLAY_NAMES[[key]]}
                    </button>
                ))}
            </div>

            {/* Table */}
            {filteredData.length > 0 ? (
                <CorrelationTable
                    sortedData={sortedData}
                    correlationKey={correlationKey}
                    pValueKey={pValueKey}
                    highlightedRow={highlightedRow}
                    onRequery={onRequery}
                    onScatterRequest={onScatterRequest}
                    selectedTab={selectedTab}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    onScrollToTop={onScrollToTop}
                />
            ) : (
                <p className="text-center my-4">
                    No {TAB_DISPLAY_NAMES[selectedTab]} correlation results
                    found.
                </p>
            )}
        </div>
    );
}

export default CorrelationResult;
