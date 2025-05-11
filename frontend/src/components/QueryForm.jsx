// QueryForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';
import MultiSelectDropdown from './MultiSelectDropdown';
import { sortOptions, nuclearFeatureSort, validateQueryForm } from '../utils/formUtils';
import './QueryForm.css';

// function QueryForm({ onSubmit }) {
function QueryForm({ onSubmit, isCollapsed, toggleCollapse }) {
    const [featureList1, setFeatureList1] = useState([]);
    const [featureList2, setFeatureList2] = useState([]);
    const [databaseList, setDatabaseList] = useState(['Nuclear']); // Default values
    const [selectedDatabase1, setSelectedDatabase1] = useState([]); // State for Database 1 selection
    const [selectedDatabase2, setSelectedDatabase2] = useState([]); // State for Database 2 selection
    const [subCategoryList1, setSubCategoryList1] = useState([]); 
    const [subCategoryList2, setSubCategoryList2] = useState([]); 
    const [selectedSubCategories1, setSelectedSubCategories1] = useState([]);
    const [selectedSubCategories2, setSelectedSubCategories2] = useState([]);
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isCollapsible, setIsCollapsible] = useState(false);

    // Add new state to track which dropdowns are open
    const [openDropdowns, setOpenDropdowns] = useState({
        database1: false,
        subcategory1: false,
        database2: false,
        subcategory2: false,
        feature2: false
    });

    // Function to handle dropdown open state changes
    const handleDropdownOpenState = (dropdownName, isOpen) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdownName]: isOpen
        }));
        
        // You can also perform any other actions when a dropdown opens/closes
        console.log(`Dropdown ${dropdownName} is now ${isOpen ? 'open' : 'closed'}`);
    };

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

    // Get list of subcategories according to the selected categories
    useEffect(() => {
        if (selectedDatabase1.length > 0 && !openDropdowns.database1) {
            console.log(`Fetching subcategories for database1 since dropdown is closed`);
            axios
                .get(`${process.env.REACT_APP_API_ROOT}features/subcategories/`, {
                    params: {
                        categories: selectedDatabase1
                    },
                    paramsSerializer: (params) => {
                        return selectedDatabase1
                            .map((db) => `categories=${encodeURIComponent(db)}`)
                            .join('&');
                    },
                })
                .then((response) => {
                    setSubCategoryList1(response.data.subcategories);
                })
                .catch((error) => {
                    console.error('Error fetching subcategories:', error);
                });
        } else {
            if (selectedDatabase1.length === 0) {
                setSubCategoryList1([]);
            }
        }
    }, [selectedDatabase1, openDropdowns.database1]);

    // Get list of subcategories according to the selected categories
    useEffect(() => {
        if (selectedDatabase2.length > 0 && !openDropdowns.database2) {
            console.log(`Fetching subcategories for database2 since dropdown is closed`);
            axios
                .get(`${process.env.REACT_APP_API_ROOT}features/subcategories/`, {
                    params: {
                        categories: selectedDatabase2
                    },
                    paramsSerializer: (params) => {
                        return selectedDatabase2
                            .map((db) => `categories=${encodeURIComponent(db)}`)
                            .join('&');
                    },
                })
                .then((response) => {
                    setSubCategoryList2(response.data.subcategories);
                })
                .catch((error) => {
                    console.error('Error fetching subcategories:', error);
                });
        } else {
            if (selectedDatabase2.length === 0) {
                setSubCategoryList2([]);
            }
        }
    }, [selectedDatabase2, openDropdowns.database2]);

    // Get list of features from API for the first set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        if (selectedDatabase1.length > 0 && selectedSubCategories1.length > 0 && !openDropdowns.subcategory1) {
            console.log(`Fetching features for subcategory1 since dropdown is closed`);
            axios
                .get(`${process.env.REACT_APP_API_ROOT}features/`, {
                    params: {
                        databaseList: selectedDatabase1,
                        subCategoryList: selectedSubCategories1,
                    },
                    paramsSerializer: (params) => {
                        const dbParams = selectedDatabase1
                            .map((db) => `databaseList=${encodeURIComponent(db)}`);
                        const subCatParams = selectedSubCategories1
                            .map((subCat) => `subCategoryList=${encodeURIComponent(subCat)}`);
                        return [...dbParams, ...subCatParams].join('&');
                    },
                })
                .then((response) => {
                    console.log('Retrieved response:', response);
                    setFeatureList1(response.data.map((feature) => feature.name));
                })
                .catch((error) => {
                    console.error('Error fetching features:', error);
                });
        } else {
            if (selectedDatabase1.length === 0 || selectedSubCategories1.length === 0) {
                setFeatureList1([]);
            }
        }
    }, [selectedDatabase1, selectedSubCategories1, openDropdowns.subcategory1]); 

    // Get list of features from API for the second set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        if (selectedDatabase2.length > 0 && selectedSubCategories2.length > 0 && !openDropdowns.subcategory2) {
            console.log(`Fetching features for subcategory2 since dropdown is closed`);
            axios
                .get(`${process.env.REACT_APP_API_ROOT}features/`, {
                    params: {
                        databaseList: selectedDatabase2,
                        subCategoryList: selectedSubCategories2,
                    },
                    paramsSerializer: (params) => {
                        const dbParams = selectedDatabase2
                            .map((db) => `databaseList=${encodeURIComponent(db)}`);
                        const subCatParams = selectedSubCategories2
                            .map((subCat) => `subCategoryList=${encodeURIComponent(subCat)}`);
                        return [...dbParams, ...subCatParams].join('&');
                    },
                })
                .then((response) => {
                    console.log('Retrieved response:', response);
                    setFeatureList2(response.data.map((feature) => feature.name));
                })
                .catch((error) => {
                    console.error('Error fetching features:', error);
                });
        } else {
            if (selectedDatabase2.length === 0 || selectedSubCategories2.length === 0) {
                setFeatureList2([]);
            }
        }
    }, [selectedDatabase2, selectedSubCategories2, openDropdowns.subcategory2]);

    const isFormValid = () => {
        return validateQueryForm({
            selectedDatabase1,
            selectedSubCategories1,
            feature1,
            selectedDatabase2,
            selectedSubCategories2,
            feature2
        });
    };

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

    // When database1 input is changed, clear subcategory1 and feature1 inputs
    const handleChangeDatabase1 = (selected) => {
        setSelectedDatabase1(selected);
        setSelectedSubCategories1([]);
        setFeature1('');
    }
    
    // When subcategory1 input is changed, clear feature1 inputs
    const handleChangeSubcategory1 = (selected) => {
        setSelectedSubCategories1(selected);
        setFeature1('');
    }
    
    // When database2 input is changed, clear subcategory2 and feature2 inputs
    const handleChangeDatabase2 =  (selected) => {
        setSelectedDatabase2(selected);
        setSelectedSubCategories2([]);
        setFeature2([]);
    }
    
    // When subcategory2 input is changed, clear feature2 inputs
    const handleChangeSubcategory2 = (selected) => {
        setSelectedSubCategories2(selected);
        setFeature2([]);
    }

    // When collapsed, only display the header with an Expand button
    if (isCollapsed) {
        return (
            <div className="max-w-4xl mx-auto my-2">
                <div className="flex justify-end">
                    <button
                        onClick={toggleCollapse}
                        style={{ backgroundColor: '#78aee8' }}
                        className="px-2 py-1 text-white rounded hover:opacity-85 mx-auto"
                    >
                        {/* &gt; */}
                        ▶
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="queryform-container">
            <div className="queryform-header">
                <h2 className="queryform-title">Query Form</h2>
                {isCollapsible && (
                    <button onClick={toggleCollapse} className="collapse-button top-right">
                        ◀
                    </button>
                )}
            </div>
            <form className="queryform-form" onSubmit={handleSubmit}>
                {/* Same structure but replace classNames with these labels: */}
                {[
                    {
                        id: 'database1',
                        label: 'Category 1:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="database1"
                                value={selectedDatabase1}
                                options={sortOptions(databaseList)}
                                onChange={handleChangeDatabase1}
                                prompt="Select one or more databases"
                                onOpenStateChange={(isOpen) => handleDropdownOpenState('database1', isOpen)}
                            />
                        ),
                    },
                    {
                        id: 'subcategory1',
                        label: 'SubCategory 1:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="subcategory1"
                                value={selectedSubCategories1}
                                options={sortOptions(subCategoryList1)}
                                onChange={handleChangeSubcategory1}
                                prompt="Select one or more subcategories"
                                onOpenStateChange={(isOpen) => handleDropdownOpenState('subcategory1', isOpen)}
                            />
                        ),
                    },
                    {
                        id: 'feature1',
                        label: 'Feature 1:',
                        component: (
                            <SearchableSelect
                                options={
                                    selectedSubCategories1.includes('Nuclear')
                                    ? nuclearFeatureSort(featureList1)
                                    : sortOptions(featureList1)
                                }
                                value={feature1}
                                onChange={setFeature1}
                                placeholder="Select a feature"
                            />
                        ),
                    },
                    {
                        id: 'database2',
                        label: 'Category 2:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="database2"
                                value={selectedDatabase2}
                                options={sortOptions(databaseList)}
                                onChange={handleChangeDatabase2}
                                prompt="Select one or more databases"
                                onOpenStateChange={(isOpen) => handleDropdownOpenState('database2', isOpen)}
                            />
                        ),
                    },
                    {
                        id: 'subcategory2',
                        label: 'SubCategory 2:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="subcategory2"
                                value={selectedSubCategories2}
                                options={sortOptions(subCategoryList2)}
                                onChange={handleChangeSubcategory2}
                                prompt="Select one or more subcategories"
                                onOpenStateChange={(isOpen) => handleDropdownOpenState('subcategory2', isOpen)}
                            />
                        ),
                    },
                    {
                        id: 'feature2',
                        label: 'Feature 2:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="feature2"
                                value={feature2}
                                options={
                                    selectedSubCategories2.includes('Nuclear')
                                    ? nuclearFeatureSort(featureList2)
                                    : sortOptions(featureList2)
                                }
                                onChange={setFeature2}
                                prompt="Select one or more features"
                                onOpenStateChange={(isOpen) => handleDropdownOpenState('feature2', isOpen)}
                            />
                        ),
                    },
                    {
                        id: 'minCorrelation',
                        label: 'Minimum Correlation:',
                        component: (
                            <input
                                type="number"
                                id="minCorrelation"
                                value={minCorrelation}
                                min="-1"
                                max="1"
                                step="0.01"
                                onChange={(e) => setMinCorrelation(e.target.value)}
                                className="queryform-input"
                            />
                        ),
                    },
                    {
                        id: 'maxPValue',
                        label: 'Maximum P-Value:',
                        component: (
                            <input
                                type="number"
                                id="maxPValue"
                                value={maxPValue}
                                min="0"
                                max="1"
                                step="0.01"
                                onChange={(e) => setMaxPValue(e.target.value)}
                                className="queryform-input"
                            />
                        ),
                    },
                ].map(({ id, label, component }) => (
                    <div className="queryform-row" key={id}>
                        <label htmlFor={id} className="queryform-label">
                            {label}
                        </label>
                        {component}
                    </div>
                ))}

                {/* You can use the open state information here if needed */}
                {openDropdowns.database1 && (
                    <div className="text-sm text-blue-500">Database 1 dropdown is open</div>
                )}
                
                <div className="submit-button-container">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={!isFormValid()}
                        style={{ opacity: isFormValid() ? 1 : 0.5, cursor: isFormValid() ? 'pointer' : 'not-allowed' }}
                    >
                        Query Database
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QueryForm;
