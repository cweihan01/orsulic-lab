// QueryForm.js
import React, { useState, useEffect, useRef } from 'react';

const TEST_FEATURE_LIST = ['A1BG', '5thPercentile', 'A23F', '99thPercentile'];

function MultiSelectDropdown({
    formFieldName,
    options,
    onChange,
    prompt = 'Select one or more options',
}) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const optionsListRef = useRef(null);

    const handleChange = (e) => {
        const isChecked = e.target.checked;
        const option = e.target.value;

        const selectedOptionSet = new Set(selectedOptions);

        if (isChecked) {
            selectedOptionSet.add(option);
        } else {
            selectedOptionSet.delete(option);
        }

        const newSelectedOptions = Array.from(selectedOptionSet);

        setSelectedOptions(newSelectedOptions);
        onChange(newSelectedOptions);
    };

    const isSelectAllEnabled = selectedOptions.length < options.length;

    const handleSelectAllClick = (e) => {
        e.preventDefault();

        const optionsInputs = optionsListRef.current.querySelectorAll('input');
        optionsInputs.forEach((input) => {
            input.checked = true;
        });

        setSelectedOptions([...options]);
        onChange([...options]);
    };

    const isClearSelectionEnabled = selectedOptions.length > 0;

    const handleClearSelectionClick = (e) => {
        e.preventDefault();

        const optionsInputs = optionsListRef.current.querySelectorAll('input');
        optionsInputs.forEach((input) => {
            input.checked = false;
        });

        setSelectedOptions([]);
        onChange([]);
    };

    return (
        <label className="relative w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 text-gray-700">
            <input type="checkbox" className="hidden peer" />

            {/* <div className="after:content-['▼'] after:text-xs after:ml-1 after:inline-flex after:items-center peer-checked:after:-rotate-180 after:transition-transform text-left pl-5"> */}
            <div className="flex justify-between items-center pl-5">
                <div className="text-left">
                    {selectedOptions.length > 0 ? (
                        <span>
                            <span className="ml-1 text-blue-500">
                                {`(${selectedOptions.length} selected)`} {''}
                            </span>
                            {selectedOptions[0] + ', ' + (selectedOptions[1] || '') + '...'}
                        </span>
                    ) : (
                        prompt
                    )}
                </div>
                <span className="after:content-['▼'] after:text-xs after:inline-flex peer-checked:after:-rotate-180 after:transition-transform after:ml-2 text-gray-500"></span>
            </div>

            <div className="absolute bg-gray-100 border rounded-lg transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto w-full max-h-60 overflow-auto">
                <ul>
                    <li>
                        <button
                            onClick={handleSelectAllClick}
                            disabled={!isSelectAllEnabled}
                            className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
                        >
                            {'Select All'}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleClearSelectionClick}
                            disabled={!isClearSelectionEnabled}
                            className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
                        >
                            {'Clear selection'}
                        </button>
                    </li>
                </ul>

                <ul ref={optionsListRef}>
                    {options.map((option, i) => {
                        return (
                            <li key={option}>
                                <label className="flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
                                    <input
                                        type="checkbox"
                                        name={formFieldName}
                                        value={option}
                                        className="cursor-pointer"
                                        onChange={handleChange}
                                    />
                                    <span className="ml-1">{option}</span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </label>
    );
}

function QueryForm({ onSubmit }) {
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState('');
    const [maxPValue, setMaxPValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = { feature1, feature2, minCorrelation, maxPValue };
        console.log('Query Parameters:', query); // Debugging query params
        onSubmit(query);
    };

    return (
        <div className="max-w-4xl mx-auto rounded-lg drop-shadow-lg bg-white p-6 my-4 bg-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Query Form</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Feature 1 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="feature1"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Feature 1:
                    </label>
                    {/* <input
                        type='text'
                        id='feature1'
                        value={feature1}
                        className='w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none'
                        onChange={(e) => setFeature1(e.target.value)}
                    /> */}
                    <select
                        id="feature1"
                        value={feature1}
                        onChange={(e) => setFeature1(e.target.value)}
                        className="w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none"
                    >
                        <option value="">Select an option</option>
                        {TEST_FEATURE_LIST.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <label
                        htmlFor="feature2"
                        className="w-full md:w-1/3 text-sm font-medium text-gray-700 md:text-right"
                    >
                        Feature 2:
                    </label>
                    {/* <input
                        type='text'
                        id='feature2'
                        value={feature2}
                        className='w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none'
                        onChange={(e) => setFeature2(e.target.value)}
                    /> */}

                    <MultiSelectDropdown
                        formFieldName="feature2"
                        options={TEST_FEATURE_LIST}
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
                        step="any"
                        id="maxPValue"
                        value={maxPValue}
                        className="w-full md:w-1/2 bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 focus:ring focus:ring-purple-100 focus:outline-none"
                        onChange={(e) => setMaxPValue(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-purple-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-purple-600 focus:ring focus:ring-purple-100 focus:outline-none"
                    >
                        Query Database
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QueryForm;
