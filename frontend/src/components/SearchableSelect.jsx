// QueryForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Add new SearchableSelect component
export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
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
