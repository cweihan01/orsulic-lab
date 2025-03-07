// QueryForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';
import MultiSelectDropdown from './MultiSelectDropdown';

// function QueryForm({ onSubmit }) {
function QueryForm({ onSubmit, isCollapsed, toggleCollapse }) {
    const [featureList1, setFeatureList1] = useState([]);
    const [featureList2, setFeatureList2] = useState([]);
    const [databaseList, setDatabaseList] = useState(['Nuclear']); // Default values
    const [selectedDatabase1, setSelectedDatabase1] = useState([]); // State for Database 1 selection
    const [selectedDatabase2, setSelectedDatabase2] = useState([]); // State for Database 2 selection
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isCollapsible, setIsCollapsible] = useState(false);

    // Get list of Categories/Databases from API
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features/categories`);
        axios
            .get(`${process.env.REACT_APP_API_ROOT}features/categories`)
            .then((response) => {
                console.log('Retrieved response:');
                console.log(response);
                setDatabaseList(response.data.categories);
            })
            .catch((error) => {
                console.error('Error fetching features:', error);
            });
    }, []);

    // Get list of features from API for the first set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        axios
            .get(`${process.env.REACT_APP_API_ROOT}features/`, {
                params: {
                    databaseList: selectedDatabase1, // Pass selectedDatabase1 as query params
                },
                paramsSerializer: (params) => {
                    return selectedDatabase1
                        .map((db) => `databaseList=${encodeURIComponent(db)}`)
                        .join('&');
                },
            })
            .then((response) => {
                console.log('Retrieved response:');
                console.log(response);
                setFeatureList1(response.data.map((feature) => feature.name));
            })
            .catch((error) => {
                console.error('Error fetching features:', error);
            });
    }, [databaseList, selectedDatabase1]);

    // Get list of features from API for the second set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        axios
            .get(`${process.env.REACT_APP_API_ROOT}features/`, {
                params: {
                    databaseList: selectedDatabase2, // Pass selectedDatabase1 as query params
                },
                paramsSerializer: (params) => {
                    return selectedDatabase2
                        .map((db) => `databaseList=${encodeURIComponent(db)}`)
                        .join('&');
                },
            })
            .then((response) => {
                console.log('Retrieved response:');
                console.log(response);
                setFeatureList2(response.data.map((feature) => feature.name));
            })
            .catch((error) => {
                console.error('Error fetching features:', error);
            });
    }, [databaseList, selectedDatabase2]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = {
            feature1,
            feature2,
            minCorrelation,
            maxPValue,
            database1: selectedDatabase1, // Include selected databases
            database2: selectedDatabase2,
        };
        console.log('Query Parameters:', query); // Debugging query params
        onSubmit(query);
        setIsCollapsible(true); // Collapsible once submitted
    };

    // When collapsed, only display the header with an Expand button
    if (isCollapsed) {
        return (
            <div className="max-w-4xl mx-auto bg-white my-2">
                <div className="flex justify-end">
                    <button
                        onClick={toggleCollapse}
                        className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 mx-auto"
                    >
                        &gt;
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white py-4 my-2 bg-gray-200">
            <div className="relative">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Query Form</h2>
                {isCollapsible && (
                    <button
                        onClick={toggleCollapse}
                        className="absolute top-0 right-0 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Collapse
                    </button>
                )}
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Database Dropdown 1 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="database1"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Database 1:
                    </label>
                    <MultiSelectDropdown
                        formFieldName="database1"
                        options={databaseList}
                        onChange={(selected) => setSelectedDatabase1(selected)} // Update state for Database 1
                        prompt="Select one or more databases"
                    />
                </div>

                {/* Feature 1 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="feature1"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Feature 1:
                    </label>
                    <SearchableSelect
                        options={featureList1}
                        value={feature1}
                        onChange={(selected) => setFeature1(selected)}
                        placeholder="Select a feature"
                    />
                </div>

                {/* Database Dropdown 2 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="database2"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Database 2:
                    </label>
                    <MultiSelectDropdown
                        formFieldName="database2"
                        options={databaseList}
                        onChange={(selected) => setSelectedDatabase2(selected)} // Update state for Database 2
                        prompt="Select one or more databases"
                    />
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="feature2"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Feature 2:
                    </label>
                    <MultiSelectDropdown
                        formFieldName="feature2"
                        options={featureList2}
                        onChange={(selected) => setFeature2(selected)}
                        prompt="Select one or more features"
                    />
                </div>

                {/* Minimum Correlation */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="minCorrelation"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Minimum Correlation:
                    </label>
                    <input
                        type="number"
                        id="minCorrelation"
                        value={minCorrelation}
                        min="-1"
                        max="1"
                        step="0.01"
                        className="w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none"
                        onChange={(e) => setMinCorrelation(e.target.value)}
                    />
                </div>

                {/* Maximum P-Value */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="maxPValue"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Maximum P-Value:
                    </label>
                    <input
                        type="number"
                        id="maxPValue"
                        value={maxPValue}
                        min="0"
                        max="1"
                        step="0.01"
                        className="w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none"
                        onChange={(e) => setMaxPValue(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-indigo-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-purple-600 focus:ring focus:ring-purple-100 focus:outline-none"
                    >
                        Query Database
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QueryForm;
