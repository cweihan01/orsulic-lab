import { useState, useEffect } from 'react';
import { getCategories } from '../services/featureService';

/**
 * Custom hook to fetch and manage category/database data based on the data source
 * @param {string} dataSource - 'cellline' or 'tcga'
 * @returns {Object} - Object containing categories, loading state, and error
 */
export function useCategoryData(dataSource) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching categories for ${dataSource}`);
        const data = await getCategories(dataSource);
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, [dataSource]);
  
  return { categories, isLoading, error };
}
