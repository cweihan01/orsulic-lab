// QueryForm.js
import React, { useState } from 'react';

function QueryForm({ onSubmit }) {
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState('');
    const [minCorrelation, setMinCorrelation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ feature1, feature2, minCorrelation });
    };

    return (
        <div className="query-form">
            <h2>Query Form</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Feature 1:</label>
                    <input
                        type="text"
                        value={feature1}
                        onChange={(e) => setFeature1(e.target.value)}
                    />
                </div>
                <div>
                    <label>Feature 2:</label>
                    <input
                        type="text"
                        value={feature2}
                        onChange={(e) => setFeature2(e.target.value)}
                    />
                </div>
                <div>
                    <label>Minimum Correlation:</label>
                    <input
                        type="number"
                        value={minCorrelation}
                        onChange={(e) => setMinCorrelation(e.target.value)}
                    />
                </div>
                <button type="submit">Proceed</button>
            </form>
        </div>
    );
}

export default QueryForm;
