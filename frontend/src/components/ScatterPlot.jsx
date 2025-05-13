import React from 'react';
import Plot from 'react-plotly.js';
import { DEPMAP_TO_CELLLINE_ID, TAB_TYPES } from '../utils/constants.js';

const ScatterPlot = ({
    data,
    handleCloseGraph,
    plotType = TAB_TYPES.SPEARMAN,
}) => {
    if (!data || data.length === 0) return null;

    let xKey, yKey;
    const featureKeys = Object.keys(data[0]).filter(
        (key) => !['cell_lines', 'Database', 'Feature'].includes(key)
    );

    if (featureKeys.length === 1) {
        xKey = yKey = featureKeys[0];
    } else if (featureKeys.length >= 2) {
        [xKey, yKey] = featureKeys;
    }

    const xValues = data.map((d) => d[xKey]);
    const yValues = data.map((d) => d[yKey]);
    const textValues = data.map(
        (d) => DEPMAP_TO_CELLLINE_ID[d.cell_lines] || d.cell_lines || ''
    );

    const layout = {
        xaxis: { title: xKey, tickangle: 0 },
        yaxis: { title: yKey },
        autosize: true,
        font: { family: 'Futura', size: 14 },
    };

    let plotData;

    if (plotType === TAB_TYPES.ANOVA) {
        const isCategorical = (v) =>
            typeof v === 'string' ||
            typeof v === 'boolean' ||
            (typeof v === 'number' && Number.isInteger(v) && v < 20);

        const isCategoricalByDistribution = (arr) => {
            const unique = [...new Set(arr.filter((v) => v !== null && v !== undefined))];
            return unique.length <= 10;
        };
        
        const xIsCat = isCategoricalByDistribution(xValues);
        const yIsCat = isCategoricalByDistribution(yValues);
        

        let catKey, numKey;
        if (xIsCat && !yIsCat) {
            catKey = xKey;
            numKey = yKey;
        } else if (!xIsCat && yIsCat) {
            catKey = yKey;
            numKey = xKey;
        } else {
            return null;
        }

        const categories = [...new Set(data.map((d) => d[catKey]))].sort(
            (a, b) =>
                typeof a === 'number'
                    ? a - b
                    : String(a).localeCompare(String(b))
        );

        plotData = categories.map((cat) => ({
            type: 'box',
            y: data.filter((d) => d[catKey] === cat).map((d) => d[numKey]),
            name: cat,
            boxpoints: 'all',
            jitter: 0.4,
            pointpos: 0,
        }));

        layout.title = `Boxplot of ${numKey} by ${catKey}`;
        layout.xaxis.title = catKey;
        layout.yaxis.title = numKey;
    } else if (plotType === TAB_TYPES.CHISQUARED) {
        const groupMap = {};
        data.forEach((d) => {
            const xCat = d[xKey];
            const yCat = d[yKey];
            if (!groupMap[yCat]) groupMap[yCat] = {};
            groupMap[yCat][xCat] = (groupMap[yCat][xCat] || 0) + 1;
        });

        const xCategories = [...new Set(data.map((d) => d[xKey]))].sort(
            (a, b) =>
                typeof a === 'number'
                    ? a - b
                    : String(a).localeCompare(String(b))
        );
        const yCategories = Object.keys(groupMap).sort((a, b) =>
            typeof a === 'number' ? a - b : String(a).localeCompare(String(b))
        );

        const colors = [
            'rgba(66, 165, 245, 0.6)',
            'rgba(239, 83, 80, 0.6)',
            'rgba(102, 187, 106, 0.6)',
            'rgba(255, 202, 40, 0.6)',
            'rgba(171, 71, 188, 0.6)',
            'rgba(255, 112, 67, 0.6)',
        ];

        plotData = yCategories.map((yCat, idx) => ({
            x: xCategories,
            y: xCategories.map((xCat) => groupMap[yCat][xCat] || 0),
            name: yCat, // Clean legend label
            type: 'bar',
            marker: {
                color: colors[idx % colors.length],
                line: {
                    color: 'rgba(0, 0, 0, 0.3)',
                    width: 1,
                },
            },
            text: xCategories.map((xCat) => groupMap[yCat][xCat] || 0),
            textposition: 'auto',
            hovertemplate:
                '%{x}<br>%{y} counts<br>Group: %{name}<extra></extra>',
        }));

        layout.title = `Grouped Bar Plot of ${xKey} and ${yKey}`;
        layout.xaxis.title = xKey;
        layout.yaxis.title = 'Count';
        layout.barmode = 'group';
        layout.legend = { title: { text: yKey } }; // <- Legend title set here
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
        layout.title = `Scatter Plot of ${xKey} vs ${yKey}`;
    }

    return (
        <div
            className="w-full flex-grow rounded-lg drop-shadow-lg p-4 my-2"
            style={{ background: 'white' }}
        >
            <div className="relative">
                <h2
                    className="text-3xl font-semibold text-gray-800 mb-4"
                    style={{ fontFamily: 'Futura' }}
                >
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
                key={plotType}
                revision={plotType}
                data={plotData}
                layout={{ ...layout, transition: { duration: 0 } }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default ScatterPlot;
