import React from "react";
import Plot from "react-plotly.js";

const ScatterPlot = ({ data }) => {
    // Prepare data for Plotly
    const xValues = data.map(item => Object.values(item)[1]);
    let yValues = data.map(item => Object.values(item)[2]);
    const textValues = data.map(item => item.cell_lines); // Optional: for hover text
    const xName = data.map(item => Object.keys(item)[1])[0] || "Feature 1";
    let yName = data.map(item => Object.keys(item)[2])[0] || "Feature 2";

    // Check if the number of attributes is not 3
    if (Object.keys(data[0]).length !== 3) {
        yValues = xValues; // Set yValues equal to xValues
        yName = xName; // Set yName equal to xName
    }

    return (
        <div className="max-w-4xl mx-auto rounded-lg drop-shadow-lg bg-white p-6 my-4 bg-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Scatter Plot</h2>
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
                }}
            />
        </div>
    );
};

export default ScatterPlot;