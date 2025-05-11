import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

export default function MultiSelectDropdown({
  formFieldName,
  value,
  options,
  onChange,
  prompt = 'Select one or more options',
  onOpenStateChange = () => {}
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  useEffect(() => {
    onOpenStateChange(isOpen);
  }, [isOpen, onOpenStateChange]);

  const filteredOptions = options.filter((option) =>
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const option = e.target.value;
    const newSet = new Set(selectedOptions);
    if (e.target.checked) newSet.add(option);
    else newSet.delete(option);
    const newSelectedOptions = Array.from(newSet);
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  const isSelectAllEnabled = filteredOptions.length > 0 && selectedOptions.length < filteredOptions.length;
  const isClearSelectionEnabled = selectedOptions.length > 0;

  const handleSelectAllClick = (e) => {
    e.preventDefault();
    const newSelectedOptions = filteredOptions.slice();
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  const handleClearSelectionClick = (e) => {
    e.preventDefault();
    setSelectedOptions([]);
    onChange([]);
  };

  const displayText = selectedOptions.length > 0 ? selectedOptions.join(', ') : prompt;

  const rowRenderer = useCallback(
    ({ key, index, style }) => {
      const option = filteredOptions[index];
      const checked = selectedOptions.includes(option);
      return (
        <div
          key={key}
          style={style}
          className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
          onClick={() => {
            const fakeEvent = { target: { value: option, checked: !checked } };
            handleChange(fakeEvent);
          }}
        >
          <input
            type="checkbox"
            name={formFieldName}
            value={option}
            checked={checked}
            readOnly
            className="cursor-pointer"
          />
          <span className="ml-2">{option}</span>
        </div>
      );
    },
    [filteredOptions, selectedOptions, handleChange, formFieldName]
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="w-full bg-gray-100 rounded-lg">
        <div className="flex items-center">
          <input
            type="text"
            className="placeholder-gray-600 w-full bg-transparent px-4 py-2 focus:outline-none"
            placeholder={isOpen ? 'Search...' : displayText}
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
          <div style={{ height: '240px' }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={filteredOptions.length}
                  rowHeight={50}
                  rowRenderer={rowRenderer}
                  overscanRowCount={5}
                />
              )}
            </AutoSizer>
          </div>
        </div>
      )}
    </div>
  );
}
