import React, { useState, useMemo, useEffect } from 'react';
import CorrelationTable from './CorrelationTable.jsx';
import LoadingIcon from './LoadingIcon.jsx';

import './CorrelationResult.css';

const TAB_KEYS = ['spearman', 'anova', 'chisq'];
const TAB_TITLES = {
    spearman: 'Spearman Correlation Results',
    anova: 'ANOVA Correlation Results',
    chisq: 'Chi-Square Correlation Results',
};
const TAB_DISPLAY_NAMES = {
    spearman: 'Spearman',
    anova: 'ANOVA',
    chisq: 'Chi-Square',
};

function CorrelationResult({
    correlationsMap,
    minCorrelation,
    maxPValue,
    onScatterRequest,
    highlightedRow,
    onRequery,
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

    return (
        <div className="w-full rounded-lg drop-shadow-lg bg-white p-4 my-2 bg-gray-200 overflow-x-auto">
            {/* Results tab title */}
            <h2
                className="text-3xl font-semibold text-gray-800 mb-2"
                style={{ fontFamily: 'Futura' }}
            >
                {TAB_TITLES[selectedTab]}
            </h2>

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
                    filteredData={filteredData}
                    correlationKey={correlationKey}
                    pValueKey={pValueKey}
                    highlightedRow={highlightedRow}
                    onRequery={onRequery}
                    onScatterRequest={onScatterRequest}
                    selectedTab={selectedTab}
                />
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default CorrelationResult;
