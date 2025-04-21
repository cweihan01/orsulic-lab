import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

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

  // Render each row for react-virtualized
  const rowRenderer = useCallback(
    ({ key, index, style }) => {
      const option = filteredOptions[index];
      return (
        <div
          key={key}
          style={style}
          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
          onClick={() => {
            onChange(option);
            setIsOpen(false);
            setSearchTerm('');
          }}
        >
          {option}
        </div>
      );
    },
    [filteredOptions, onChange]
  );

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div className="w-full bg-gray-100 rounded-lg">
                <input
                    type="text"
                    className="text-gray-600 placeholder-gray-600 w-full bg-transparent px-4 py-2 focus:outline-none"
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
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg" style={{ height: '240px' }}>
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
      )}
    </div>
  );
}
