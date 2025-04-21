import React from 'react';
import Plot from 'react-plotly.js';

const ScatterPlot = ({ data, handleCloseGraph }) => {
    // Prepare data for Plotly
    const xValues = data.map((item) => Object.values(item)[1]);
    let yValues = data.map((item) => Object.values(item)[2]);
    const textValues = data.map((item) => item.cell_lines); // Optional: for hover text
    const xName = data.map((item) => Object.keys(item)[1])[0] || 'Feature 1';
    let yName = data.map((item) => Object.keys(item)[2])[0] || 'Feature 2';

    // Check if the number of attributes is not 3
    if (Object.keys(data[0]).length !== 3) {
        yValues = xValues; // Set yValues equal to xValues
        yName = xName; // Set yName equal to xName
    }

    return (
        <div
            className="w-full flex-grow rounded-lg drop-shadow-lg p-4 my-2"
            // style={{ background: 'linear-gradient(135deg, #bad7f7, #e6bef7)' }}
            style={{ background: 'white' }}
        >
            <div className="relative">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Futura' }}>Scatter Plot</h2>
                <button
                    onClick={handleCloseGraph}
                    style={{ backgroundColor: '#78aee8', fontFamily: 'Futura' }}
                    className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 text-white rounded-lg hover:opacity-85"
                >
                    Close Graph
                </button>
            </div>
            <Plot
                data={[
                    {
                        x: xValues,
                        y: yValues,
                        mode: 'markers',
                        type: 'scatter',
                        marker: { size: 10, color: 'black' },
                        text: textValues, // Optional: hover text
                        hoverinfo: 'text', // Show cell lines on hover
                    },
                ]}
                layout={{
                    title: `Scatter Plot of ${xName} vs ${yName}`,
                    xaxis: { title: xName },
                    yaxis: { title: yName },
                    autosize: true,
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default ScatterPlot;
