// QueryForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Add new SearchableSelect component
function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                if (!value) {
                    setSearchTerm('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [value]);

    return (
        <div ref={dropdownRef} className="relative w-full md:w-1/2">
            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                <input
                    type="text"
                    className="w-full bg-transparent px-4 py-2 focus:outline-none"
                    placeholder={value || placeholder}
                    value={isOpen ? searchTerm : value || ''}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>
            
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <ul className="max-h-60 overflow-auto">
                        {filteredOptions.map((option) => (
                            <li
                                key={option}
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Modify MultiSelectDropdown to include search
function MultiSelectDropdown({
    formFieldName,
    options,
    onChange,
    prompt = 'Select one or more options',
}) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const optionsListRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const isSelectAllEnabled = filteredOptions.length > 0 && selectedOptions.length < filteredOptions.length;
    const isClearSelectionEnabled = selectedOptions.length > 0;

    const handleSelectAllClick = (e) => {
        e.preventDefault();
        // Select only the filtered options
        const newSelectedOptions = filteredOptions;
        setSelectedOptions(newSelectedOptions);
        onChange(newSelectedOptions);
    };

    const handleClearSelectionClick = (e) => {
        e.preventDefault();
        setSelectedOptions([]);
        onChange([]);
    };

    // this is a bit slow because of the .join() call
    // Change this, to another place holder if needed
    const displayText = selectedOptions.length > 0 
        ? selectedOptions.join(', ')
        : prompt;

    return (
        <div ref={dropdownRef} className="relative w-full md:w-1/2">
            <div className="w-full bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                <div className="flex items-center">
                    <input
                        type="text"
                        className="w-full bg-transparent px-4 py-2 focus:outline-none"
                        placeholder={isOpen ? "Search..." : displayText}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                    <span className="pr-4 text-xs text-gray-500">▼</span>
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <ul className="border-b">
                        <li>
                            <button
                                onClick={handleSelectAllClick}
                                disabled={!isSelectAllEnabled}
                                className="w-full text-left px-4 py-2 text-blue-600 disabled:opacity-50 hover:bg-blue-50"
                            >
                                Select All
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleClearSelectionClick}
                                disabled={!isClearSelectionEnabled}
                                className="w-full text-left px-4 py-2 text-blue-600 disabled:opacity-50 hover:bg-blue-50"
                            >
                                Clear selection
                            </button>
                        </li>
                    </ul>

                    <ul ref={optionsListRef} className="max-h-60 overflow-auto">
                        {filteredOptions.map((option) => (
                            <li key={option}>
                                <label className="flex items-center cursor-pointer px-4 py-2 hover:bg-blue-50">
                                    <input
                                        type="checkbox"
                                        name={formFieldName}
                                        value={option}
                                        checked={selectedOptions.includes(option)}
                                        className="cursor-pointer"
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2">{option}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function QueryForm({ onSubmit }) {
    const [featureList, setFeatureList] = useState([]);
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);

    // Get list of features from API
    useEffect(() => {
        console.log('Making request with: ' + `${process.env.REACT_APP_API_ROOT}features`);
        axios
            .get(`${process.env.REACT_APP_API_ROOT}features/`)
            .then((response) => {
                console.log('Retrieved response:');
                console.log(response);
                setFeatureList(response.data.map((feature) => feature.name));
            })
            .catch((error) => {
                console.error('Error fetching features:', error);
            });
    }, []);

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
                    <SearchableSelect
                        options={featureList}
                        value={feature1}
                        onChange={(selected) => setFeature1(selected)}
                        placeholder="Select a feature"
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
                        options={featureList}
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
