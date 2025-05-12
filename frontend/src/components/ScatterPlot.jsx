import React from 'react';
import Plot from 'react-plotly.js';
import depMapToCellLineID from '../cellline_mapping.js';


const ScatterPlot = ({ data, handleCloseGraph, plotType = 'spearman' }) => {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const xKey = keys[1];
    const yKey = keys[2];

    const xValues = data.map(d => d[xKey]);
    const yValues = data.map(d => d[yKey]);
    const textValues = data.map(d => depMapToCellLineID[d.cell_lines] || d.cell_lines || '');

    const title =
        plotType === 'anova'
            ? `Boxplot of ${xKey} vs ${yKey}`
            : plotType === 'chisq'
            ? `Grouped Bar Plot of ${xKey} and ${yKey}`
            : `Scatter Plot of ${xKey} vs ${yKey}`;

    const layout = {
        title,
        xaxis: { title: xKey, tickangle: -30 },
        yaxis: { title: yKey },
        autosize: true,
        font: { family: 'Futura', size: 14 },
    };

    let plotData;

    if (plotType === 'anova') {
        const isCategorical = v =>
            typeof v === 'string' || typeof v === 'boolean' ||
            (typeof v === 'number' && Number.isInteger(v) && v < 20);

        const xIsCat = isCategorical(xValues[0]);
        const yIsCat = isCategorical(yValues[0]);

        let catKey, numKey;
        if (xIsCat && !yIsCat) {
            catKey = xKey;
            numKey = yKey;
        } else if (!xIsCat && yIsCat) {
            catKey = yKey;
            numKey = xKey;
        } else {
            return (
                <div className="w-full p-4 my-2 rounded bg-white text-red-600">
                    <h2 className="text-xl font-bold mb-2">Invalid ANOVA plot</h2>
                    <p>Exactly one variable must be categorical and one must be numeric.</p>
                </div>
            );
        }

        const categories = [...new Set(data.map(d => d[catKey]))].sort((a, b) =>
            typeof a === 'number' ? a - b : String(a).localeCompare(String(b))
        );

        plotData = categories.map(cat => ({
            type: 'box',
            y: data.filter(d => d[catKey] === cat).map(d => d[numKey]),
            name: cat,
            boxpoints: 'all',
            jitter: 0.4,
            pointpos: 0,
        }));
    } else if (plotType === 'chisq') {
        // Grouped bar plot for cat vs cat
        const groupMap = {};
        data.forEach(d => {
            const xCat = d[xKey];
            const yCat = d[yKey];
            if (!groupMap[yCat]) groupMap[yCat] = {};
            groupMap[yCat][xCat] = (groupMap[yCat][xCat] || 0) + 1;
        });

        const xCategories = [...new Set(data.map(d => d[xKey]))].sort((a, b) =>
            typeof a === 'number' ? a - b : String(a).localeCompare(String(b))
        );
        const yCategories = Object.keys(groupMap).sort((a, b) =>
            typeof a === 'number' ? a - b : String(a).localeCompare(String(b))
        );
        

        const colors = [
            'rgba(66, 165, 245, 0.6)',   // blue
            'rgba(239, 83, 80, 0.6)',    // red
            'rgba(102, 187, 106, 0.6)',  // green
            'rgba(255, 202, 40, 0.6)',   // yellow
            'rgba(171, 71, 188, 0.6)',   // purple
            'rgba(255, 112, 67, 0.6)',   // orange
        ];

        plotData = yCategories.map((yCat, idx) => ({
            x: xCategories,
            y: xCategories.map(xCat => groupMap[yCat][xCat] || 0),
            name: yCat,
            type: 'bar',
            marker: {
                color: colors[idx % colors.length],
                line: {
                    color: 'rgba(0, 0, 0, 0.3)',
                    width: 1,
                },
            },
            text: xCategories.map(xCat => groupMap[yCat][xCat] || 0),
            textposition: 'auto',
            hovertemplate: '%{x}<br>%{y} counts<br>Group: %{name}<extra></extra>',
        }));

        layout.barmode = 'group';
        layout.yaxis.title = 'Count';
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
                    {layout.title}
                </h2>
                <button
                    onClick={handleCloseGraph}
                    style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                    className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 text-white rounded-lg hover:opacity-85"
                >
                    Close Graph
                </button>
            </div>
            <Plot
                data={plotData}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default ScatterPlot;
