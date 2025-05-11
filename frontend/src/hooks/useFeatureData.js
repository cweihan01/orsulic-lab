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
  
  useEffect(() => {
    if (selectedDatabases.length > 0 && !isDropdownOpen) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          console.log(`Fetching subcategories for databases: ${selectedDatabases.join(', ')}`);
          const data = await getSubcategories(selectedDatabases);
          setSubcategories(data);
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          setError(err.message || 'Failed to fetch subcategories');
          setSubcategories([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    } else if (selectedDatabases.length === 0) {
      setSubcategories([]);
      setError(null);
      setIsLoading(false);
    }
  }, [selectedDatabases, isDropdownOpen]);
  
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
  
  useEffect(() => {
    if (selectedDatabases.length > 0 && selectedSubcategories.length > 0 && !isDropdownOpen) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          console.log(`Fetching features for databases: ${selectedDatabases.join(', ')} and subcategories: ${selectedSubcategories.join(', ')}`);
          const data = await getFeatures(selectedDatabases, selectedSubcategories);
          setFeatures(data);
        } catch (err) {
          console.error('Error fetching features:', err);
          setError(err.message || 'Failed to fetch features');
          setFeatures([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    } else if (selectedDatabases.length === 0 || selectedSubcategories.length === 0) {
      setFeatures([]);
      setError(null);
      setIsLoading(false);
    }
  }, [selectedDatabases, selectedSubcategories, isDropdownOpen]);
  
  return { features, isLoading, error };
} 