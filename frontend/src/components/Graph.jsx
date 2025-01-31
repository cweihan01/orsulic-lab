import React from "react";
import Plot from "react-plotly.js";

const Graph = ({ data }) => {
    // Transform your data into a format suitable for Plotly
    const plotData = data.map((item) => ({
        x: [item.feature1], // Replace with your actual feature names
        y: [item.spearman_correlation], // Replace with correlation values
        type: "bar",
        name: item.feature2, // Replace with feature names or any identifier
    }));

    return (
        <div className="max-w-4xl mx-auto rounded-lg drop-shadow-lg bg-white p-6 my-4 bg-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Correlation Chart</h2>
            <Plot
                data={plotData}
                layout={{
                    title: "Feature Correlations",
                    xaxis: { title: "Feature 1" },
                    yaxis: { title: "Spearman Correlation" },
                    barmode: "group",
                    width: 800,
                    height: 500,
                }}
            />
        </div>
    );
};

export default Graph;
