// QueryForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';
import MultiSelectDropdown from './MultiSelectDropdown';
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
        if (selectedDatabase1.length > 0) {
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
            setSubCategoryList1([]);
        }
    }, [selectedDatabase1]);

    // Get list of subcategories according to the selected categories
    useEffect(() => {
        if (selectedDatabase2.length > 0) {
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
            setSubCategoryList2([]);
        }
    }, [selectedDatabase2]);

    // Get list of features from API for the first set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        if (selectedDatabase1.length > 0 && selectedSubCategories1.length > 0) {  // Only make request if databases are selected
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
            setFeatureList1([]);
        }
    }, [selectedDatabase1, selectedSubCategories1]); 

    // Get list of features from API for the second set of databases selected
    useEffect(() => {
        console.log(`Making request with: ${process.env.REACT_APP_API_ROOT}features`);
        if (selectedDatabase2.length > 0 && selectedSubCategories2.length > 0) {  // Only make request if databases are selected
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
            setFeatureList2([]);
        }
    }, [selectedDatabase2, selectedSubCategories2]); 

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
                        label: 'Database 1:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="database1"
                                value={selectedDatabase1}
                                options={databaseList}
                                onChange={handleChangeDatabase1}
                                prompt="Select one or more databases"
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
                                options={subCategoryList1}
                                onChange={handleChangeSubcategory1}
                                prompt="Select one or more subcategories"
                            />
                        ),
                    },
                    {
                        id: 'feature1',
                        label: 'Feature 1:',
                        component: (
                            <SearchableSelect
                                options={featureList1}
                                value={feature1}
                                onChange={setFeature1}
                                placeholder="Select a feature"
                            />
                        ),
                    },
                    {
                        id: 'database2',
                        label: 'Database 2:',
                        component: (
                            <MultiSelectDropdown
                                formFieldName="database2"
                                value={selectedDatabase2}
                                options={databaseList}
                                onChange={handleChangeDatabase2}
                                prompt="Select one or more databases"
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
                                options={subCategoryList2}
                                onChange={handleChangeSubcategory2}
                                prompt="Select one or more subcategories"
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
                                options={featureList2}
                                onChange={setFeature2}
                                prompt="Select one or more features"
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

                <div className="submit-button-container">
                    <button type="submit" className="submit-button">
                        Query Database
                    </button>
                </div>
            </form>
        </div>
    );
}

export default QueryForm;
