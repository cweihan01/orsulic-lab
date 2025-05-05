import React from 'react';
import Plot from 'react-plotly.js';

const ScatterPlot = ({ data, handleCloseGraph, plotType = 'spearman' }) => {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const xKey = keys[1];
    const yKey = keys[2];

    const xValues = data.map(d => d[xKey]);
    const yValues = data.map(d => d[yKey]);
    const textValues = data.map(d => d.cell_lines || '');

    const title =
        plotType === 'anova'
            ? `Boxplot of ${yKey} grouped by ${xKey}`
            : plotType === 'chisq'
            ? `Grouped Bar Plot of ${xKey} and ${yKey}`
            : `Scatter Plot of ${xKey} vs ${yKey}`;

    const layout = {
        title,
        xaxis: { title: xKey },
        yaxis: { title: yKey },
        autosize: true,
    };

    let plotData;

    if (plotType === 'anova') {
        const groups = [...new Set(xValues)];
        plotData = groups.map(group => ({
            type: 'box',
            y: data.filter(d => d[xKey] === group).map(d => d[yKey]),
            name: group,
            boxpoints: 'all',
            jitter: 0.4,
            pointpos: -1.5,
        }));
    } else if (plotType === 'chisq') {
    // Create grouped counts
    const groupMap = {};
    data.forEach(d => {
        const xCat = d[xKey];
        const yCat = d[yKey];
        if (!groupMap[yCat]) groupMap[yCat] = {};
        groupMap[yCat][xCat] = (groupMap[yCat][xCat] || 0) + 1;
    });

    const xCategories = [...new Set(data.map(d => d[xKey]))];
    const yCategories = Object.keys(groupMap);

    plotData = yCategories.map(yCat => ({
        x: xCategories,
        y: xCategories.map(xCat => groupMap[yCat][xCat] || 0),
        name: yCat,
        type: 'bar',
    }));

    layout.barmode = 'group';
} else {
        plotData = [
            {
                x: xValues,
                y: yValues,
                mode: 'markers',
                type: 'scatter',
                marker: { size: 10, color: 'black' },
                text: textValues,
                hoverinfo: 'text',
            },
        ];
    }

    return (
        <div className="w-full flex-grow rounded-lg drop-shadow-lg p-4 my-2" style={{ background: 'white' }}>
            <div className="relative">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Futura' }}>
                    {title}
                </h2>
                <button
                    onClick={handleCloseGraph}
                    style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                    className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 text-white rounded-lg hover:opacity-85"
                >
                    Close Graph
                </button>
            </div>
            <Plot data={plotData} layout={layout} useResizeHandler={true} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default ScatterPlot;
