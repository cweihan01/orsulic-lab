import { useState, useEffect } from 'react';
import { getSubcategories, getFeatures } from '../services/featureService';

/**
 * Custom hook to fetch and manage subcategory data based on selected databases
 * @param {Array} selectedDatabases - Array of selected database/category names
 * @param {boolean} isDropdownOpen - Whether the related dropdown is currently open
 * @returns {Array} - Array of subcategories
 */
export function useSubcategoryData(selectedDatabases, isDropdownOpen) {
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedSelection, setLastFetchedSelection] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);
  
  // Track selection changes while dropdown is open
  useEffect(() => {
    // Only update pending selection when dropdown is open
    if (isDropdownOpen) {
      setPendingSelection(selectedDatabases);
    }
  }, [selectedDatabases, isDropdownOpen]);
  
  // Only fetch when dropdown closes and selection has changed
  useEffect(() => {
    // Check if dropdown just closed and we have a pending selection
    if (!isDropdownOpen && pendingSelection) {
      // Compare current pending selection with last fetched selection
      const currentSelectionStr = JSON.stringify(pendingSelection.sort());
      const lastSelectionStr = lastFetchedSelection ? JSON.stringify(lastFetchedSelection.sort()) : null;
      
      // Only fetch if the selection has changed
      if (currentSelectionStr !== lastSelectionStr && pendingSelection.length > 0) {
        const fetchData = async () => {
          try {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching subcategories for databases: ${pendingSelection.join(', ')}`);
            const data = await getSubcategories(pendingSelection);
            setSubcategories(data);
            // Update last fetched selection after successful fetch
            setLastFetchedSelection(pendingSelection);
          } catch (err) {
            console.error('Error fetching subcategories:', err);
            setError(err.message || 'Failed to fetch subcategories');
            setSubcategories([]);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchData();
      }
    } else if (selectedDatabases.length === 0) {
      setSubcategories([]);
      setError(null);
      setIsLoading(false);
      setLastFetchedSelection(null);
    }
  }, [isDropdownOpen, pendingSelection, lastFetchedSelection, selectedDatabases.length]);
  
  return { subcategories, isLoading, error };
}

/**
 * Custom hook to fetch and manage feature data based on selected databases and subcategories
 * @param {Array} selectedDatabases - Array of selected database/category names
 * @param {Array} selectedSubcategories - Array of selected subcategory names
 * @param {boolean} isDropdownOpen - Whether the related dropdown is currently open
 * @returns {Array} - Array of features
 */
export function useFeatureData(selectedDatabases, selectedSubcategories, isDropdownOpen) {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedParams, setLastFetchedParams] = useState(null); 
  const [pendingParams, setPendingParams] = useState(null);
  
  // Track selection changes while dropdown is open
  useEffect(() => {
    // Only update pending params when dropdown is open
    if (isDropdownOpen) {
      setPendingParams({
        databases: selectedDatabases,
        subcategories: selectedSubcategories
      });
    }
  }, [selectedDatabases, selectedSubcategories, isDropdownOpen]);
  
  // Only fetch when dropdown closes and parameters have changed
  useEffect(() => {
    // Check if dropdown just closed and we have pending params
    if (!isDropdownOpen && pendingParams) {
      // Compare current pending params with last fetched params
      const currentParamsStr = JSON.stringify({
        databases: pendingParams.databases.sort(),
        subcategories: pendingParams.subcategories.sort()
      });
      
      const lastParamsStr = lastFetchedParams ? JSON.stringify({
        databases: lastFetchedParams.databases.sort(),
        subcategories: lastFetchedParams.subcategories.sort()
      }) : null;
      
      // Only fetch if params have changed and we have valid selections
      if (currentParamsStr !== lastParamsStr && 
          pendingParams.databases.length > 0 && 
          pendingParams.subcategories.length > 0) {
        
        const fetchData = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const data = await getFeatures(
              pendingParams.databases, 
              pendingParams.subcategories
            );
            setFeatures(data);
            // Update last fetched params after successful fetch
            setLastFetchedParams(pendingParams);
          } catch (err) {
            console.error('Error fetching features:', err);
            setError(err.message || 'Failed to fetch features');
            setFeatures([]);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchData();
      }
    } else if (selectedDatabases.length === 0 || selectedSubcategories.length === 0) {
      setFeatures([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isDropdownOpen, pendingParams, lastFetchedParams, selectedDatabases.length, selectedSubcategories?.length]);
  
  return { features, isLoading, error };
} 