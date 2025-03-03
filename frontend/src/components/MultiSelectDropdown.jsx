// QueryForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Modify MultiSelectDropdown to include search
export default function MultiSelectDropdown({
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