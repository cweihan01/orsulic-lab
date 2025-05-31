// QueryForm.jsx
import React, { useEffect, useState, useCallback } from 'react';
import SearchableSelect from './SearchableSelect';
import MultiSelectDropdown from './MultiSelectDropdown';
import { sortOptions, nuclearFeatureSort, validateQueryForm } from '../utils/formUtils';
import { useCategoryData } from '../hooks/useCategoryData';
import { useSubcategoryData, useFeatureData } from '../hooks/useFeatureData';
import './QueryForm.css';

function QueryForm({ onSubmit, isCollapsed, lastQuery }) {
    const [dataSource, setDataSource] = useState(() => {
        return localStorage.getItem('selectedDataSource') || 'cellline';
      });
      
    const [selectedDatabase1, setSelectedDatabase1] = useState([]);
    const [selectedDatabase2, setSelectedDatabase2] = useState([]);
    const [selectedSubCategories1, setSelectedSubCategories1] = useState([]);
    const [selectedSubCategories2, setSelectedSubCategories2] = useState([]);
    const [feature1, setFeature1] = useState('');
    const [feature2, setFeature2] = useState([]);
    const [minCorrelation, setMinCorrelation] = useState(0.0);
    const [maxPValue, setMaxPValue] = useState(1.0);
    const [isCollapsible, setIsCollapsible] = useState(false);
  
    const celllineCategories = ["Nuclear", "Molecular", "Drug Screen"];
    const tcgaCategories = ["Nuclear", "Molecular", "Clinical", "FracLac"];
  
    const [openDropdowns, setOpenDropdowns] = useState({
      database1: false,
      subcategory1: false,
      database2: false,
      subcategory2: false,
      feature2: false
    });
  
    // 🟢 Fetch hooks based on data source
    const { categories: databaseList } = useCategoryData(dataSource);
    const { subcategories: subCategoryList1 } = useSubcategoryData(dataSource, selectedDatabase1, openDropdowns.database1);
    const { subcategories: subCategoryList2 } = useSubcategoryData(dataSource, selectedDatabase2, openDropdowns.database2);
    const { features: featureList1 } = useFeatureData(dataSource, selectedDatabase1, selectedSubCategories1, openDropdowns.subcategory1);
    const { features: featureList2 } = useFeatureData(dataSource, selectedDatabase2, selectedSubCategories2, openDropdowns.subcategory2);
  
    const [savedStates, setSavedStates] = useState(() => {
        try {
          const saved = localStorage.getItem('queryFormSavedStates');
          return saved ? JSON.parse(saved) : { cellline: null, tcga: null };
        } catch {
          return { cellline: null, tcga: null };
        }
      });

    useEffect(() => {
        localStorage.setItem('queryFormSavedStates', JSON.stringify(savedStates));
    }, [savedStates]);
    

   useEffect(() => {
    if (!lastQuery) return;
    if ((lastQuery.tcga && dataSource !== "tcga") || (!lastQuery.tcga && dataSource !== "cellline")) {
      return; // prevent loading the wrong tab's query
    }
    setSelectedDatabase1(lastQuery.database1 || []);
    setSelectedSubCategories1(lastQuery.subcategory1 || []);
    setFeature1(lastQuery.feature1 || '');
    setSelectedDatabase2(lastQuery.database2 || []);
    setSelectedSubCategories2(lastQuery.subcategory2 || []);
    setFeature2(lastQuery.feature2 || []);
    setMinCorrelation(lastQuery.minCorrelation ?? 0.0);
    setMaxPValue(lastQuery.maxPValue ?? 1.0);
  }, [lastQuery, dataSource]);
  


    // Memoize the handleDropdownOpenState function to prevent it from being recreated on every render
    const handleDropdownOpenState = useCallback((dropdownName, isOpen) => {
        setOpenDropdowns(prev => {
            // Only update if the state actually changed to prevent unnecessary re-renders
            if (prev[dropdownName] === isOpen) return prev;
            return {
                ...prev,
                [dropdownName]: isOpen
            };
        });
    }, []);

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

    const handleResetForm = (tab = dataSource) => {
        setSavedStates(prev => ({ ...prev, [tab]: null }));
        setSelectedDatabase1([]);
        setSelectedDatabase2([]);
        setSelectedSubCategories1([]);
        setSelectedSubCategories2([]);
        setFeature1('');
        setFeature2([]);
        setMinCorrelation(0.0);
        setMaxPValue(1.0);
        setIsCollapsible(false);
      };
      

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = {
            feature1,
            feature2,
            minCorrelation,
            subcategory1: selectedSubCategories1,
            subcategory2: selectedSubCategories2,
            maxPValue,
            database1: selectedDatabase1, // Include selected databases
            database2: selectedDatabase2,
            tcga: dataSource === "tcga" // <-- added line
        };
        console.log('Query Parameters:', query); // Debugging query params
        onSubmit(query);
        setIsCollapsible(true); // Collapsible once submitted
    };

    const switchTab = (toTab) => {
        const prevTab = dataSource;
        const currentState = getCurrentFormState();
      
        // Save current form state under previous tab
        setSavedStates(prev => ({ ...prev, [prevTab]: currentState }));
      
        // Persist tab selection (optional)
        localStorage.setItem('selectedDataSource', toTab);
      
        // Update the current tab
        setDataSource(toTab);
      
        // Delay restoring until after the tab state updates
        setTimeout(() => {
          if (savedStates[toTab]) {
            restoreFormState(savedStates[toTab]);
          } else {
            handleResetForm(toTab);
          }
        }, 0);
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
    // if (isCollapsed) {
    //     return (
    //         <div className="max-w-4xl mx-auto my-2">
    //             <div className="flex justify-end">
    //                 <button
    //                     onClick={toggleCollapse}
    //                     style={{ backgroundColor: '#78aee8' }}
    //                     className="px-2 py-1 text-white rounded hover:opacity-85 mx-auto"
    //                 >
    //                     ▶
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

      const getCurrentFormState = () => ({
        selectedDatabase1,
        selectedDatabase2,
        selectedSubCategories1,
        selectedSubCategories2,
        feature1,
        feature2,
        minCorrelation,
        maxPValue
      });
      
      const restoreFormState = (state) => {
        if (!state) return;
        setSelectedDatabase1(state.selectedDatabase1 || []);
        setSelectedDatabase2(state.selectedDatabase2 || []);
        setSelectedSubCategories1(state.selectedSubCategories1 || []);
        setSelectedSubCategories2(state.selectedSubCategories2 || []);
        setFeature1(state.feature1 || '');
        setFeature2(state.feature2 || []);
        setMinCorrelation(state.minCorrelation ?? 0.0);
        setMaxPValue(state.maxPValue ?? 1.0);
      };
      
      

    return (
        <>
            <div className="queryform-tab-toggle">

                <button
                    type="button"
                    onClick={() => {
                        setSavedStates(prev => ({ ...prev, [dataSource]: getCurrentFormState() }));
                        localStorage.setItem("selectedDataSource", "cellline"); // or "tcga"
                        setDataSource("cellline");
                        if (savedStates.cellline) {
                        restoreFormState(savedStates.cellline);
                        } else {
                        handleResetForm("cellline");
                        }
                    }}
                    className={dataSource === "cellline" ? "active-tab" : ""}
                    >
                    Cell Line
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSavedStates(prev => ({ ...prev, [dataSource]: getCurrentFormState() }));
                        localStorage.setItem("selectedDataSource", "tcga"); // or "tcga"
                        setDataSource("tcga");
                        if (savedStates.tcga) {
                        restoreFormState(savedStates.tcga);
                        } else {
                        handleResetForm("tcga");
                        }
                    }}
                    className={dataSource === "tcga" ? "active-tab" : ""}
                    >
                    TCGA
                </button>


            </div>
            
            <div className="queryform-container">
                <div className="queryform-header">
                    <h2 className="queryform-title">Query Form</h2>
                    {/* {isCollapsible && (
                        <button onClick={toggleCollapse} className="collapse-button top-right">
                            ◀
                        </button>
                    )} */}
                </div>

                <form className="queryform-form" onSubmit={handleSubmit}>
                    {[
                        {
                            id: 'database1',
                            label: 'Category 1:',
                            component: (
                                <MultiSelectDropdown
                                    formFieldName="database1"
                                    value={selectedDatabase1}
                                    options={sortOptions(
                                        databaseList.filter(db =>
                                          dataSource === "tcga"
                                            ? tcgaCategories.includes(db)
                                            : celllineCategories.includes(db)
                                        )
                                      )}
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
                                    options={sortOptions(
                                        databaseList.filter(db =>
                                          dataSource === "tcga"
                                            ? tcgaCategories.includes(db)
                                            : celllineCategories.includes(db)
                                        )
                                      )}
                                      
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
                                

                    <div className="submit-button-container">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!isFormValid()}
                            style={{
                                opacity: isFormValid() ? 1 : 0.5,
                                cursor: isFormValid() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Query
                        </button>

                        <button
                            type="button"
                            className="reset-button ml-4"
                            onClick={handleResetForm}
                            style={{
                                marginLeft: '12px',
                                backgroundColor: '#e5e7eb',
                                color: '#333',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                            }}
                        >
                            Reset
                        </button>
                        
                    </div>
                </form>
            </div>
        </>
    );
}

export default QueryForm;
