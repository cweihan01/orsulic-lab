import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import depMapToCellLineID from '../cellline_mapping.js';
import './CorrelationResult.css';

const TAB_KEYS = ['spearman', 'anova', 'chisquared'];
const TAB_TITLES = {
  spearman: 'Spearman Correlation Results',
  anova: 'ANOVA Correlation Results',
  chisquared: 'Chi-Square Correlation Results',
};
const TAB_DISPLAY_NAMES = {
  spearman: 'Spearman',
  anova: 'ANOVA',
  chisquared: 'Chi-Square',
};

function CorrelationResult({
  correlationsMap,
  minCorrelation,
  maxPValue,
  onScatterRequest,
  highlightedRow,
  onRequery,
  isLoading,
  onCancel
}) {
  const [selectedTab, setSelectedTab] = useState('spearman');
  const [visibleCount, setVisibleCount] = useState(100);
  const RESULTS_INCREMENT = 100;

  const data = correlationsMap[selectedTab] || [];

  useEffect(() => {
    const firstNonEmpty = TAB_KEYS.find(key =>
      Array.isArray(correlationsMap[key]) && correlationsMap[key].length > 0
    );
    setSelectedTab(firstNonEmpty || 'spearman');
  }, [correlationsMap]);

  useEffect(() => {
    setVisibleCount(100);
  }, [selectedTab, minCorrelation, maxPValue]);

  const { correlationKey, pValueKey } = useMemo(() => {
    if (!data || data.length === 0) {
      return { correlationKey: null, pValueKey: null };
    }
    const cols = Object.keys(data[0]);
    const correlationKey = cols.find(k => k.endsWith('_correlation'));
    const pValueKey = cols.find(k => k.toLowerCase().endsWith('pvalue')) || null;
    return { correlationKey, pValueKey };
  }, [data]);

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

  const handleDownloadData = async (feature1, feature2, database1, database2, plotType) => {
    try {
      const payload = { feature1, feature2, database1, database2, plotType };
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
        headerRow = headers.flatMap(header =>
          header === 'cell_lines'
            ? ['DepMap ID', header, 'Cell Line ID']
            : [header]
        );
      } else {
        headerRow = headers;
      }
      csvRows.push(headerRow.join(','));

      scatterData.forEach(obj => {
        const row = [];
        headers.forEach(header => {
          const val = obj[header] ?? '';
          if (isSpearman && header === 'cell_lines') {
            const depMapId = val;
            const actualCellLineID = depMapToCellLineID[depMapId] || '';
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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        if (!pValueKey && !correlationKey) return;
    
        const defaultKey = correlationKey || pValueKey || 'count';
        const defaultDirection = correlationKey ? 'descending' : 'ascending';
    
        setSortConfig({ key: defaultKey, direction: defaultDirection });
    }, [correlationKey, pValueKey]);
    
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
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Sort Spearman correlation by absolute value
        const isSpearman = selectedTab === 'spearman' && sortConfig.key === correlationKey;
        if (isSpearman && typeof aVal === 'number' && typeof bVal === 'number') {
            aVal = Math.abs(aVal);
            bVal = Math.abs(bVal);
        }

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
}, [filteredData, sortConfig, selectedTab, correlationKey]);

    const visibleData = useMemo(() => sortedData.slice(0, visibleCount), [sortedData, visibleCount]);







    // 7) render
    return (
        <>
        {/* Loading icon */}
        {isLoading && (
            <div className="flex items-center justify-center mb-4 space-x-3">
            <div className="loader w-6 h-6"></div>
            <span className="text-gray-600">Loading query results…</span>
                <button
                    onClick={onCancel}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Cancel
                </button>
            </div>
        )}

        <div className="w-full rounded-lg drop-shadow-lg bg-white p-4 my-2 bg-gray-200 overflow-x-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2" style={{fontFamily:'Futura'}}>
                {TAB_TITLES[selectedTab]}
            </h2>

            {/* 3) Tab buttons */}
            <div className="tab-buttons-container">
                {TAB_KEYS.map((key) => (
                    <button
                        key={key}
                        onClick={() => setSelectedTab(key)}
                        className={`tab-button ${selectedTab === key ? 'active' : ''}`}
                    >
                        {TAB_DISPLAY_NAMES[[key]]}
                    </button>
                ))}
            </div>

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
    onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onScatterRequest(
            item.feature_1,
            item.feature_2,
            item.database_1,
            item.database_2,
            pValueKey.includes('anova') ? 'anova' : pValueKey.includes('chisq') ? 'chisq' : 'spearman'
        );
    }}
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
                                                        item.database_2,
                                                        pValueKey.includes('anova') ? 'anova' : pValueKey.includes('chisq') ? 'chisq' : 'spearman'
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
            onClick={() => setVisibleCount(prev => prev + RESULTS_INCREMENT)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Load More
        </button>
    </div>
)}


                    </div>
                </>
            ) : (
                <p>No results found</p>
            )}
        </div>
        </>
    );
}

export default CorrelationResult;
