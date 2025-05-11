import { useState, useEffect } from 'react';
import { getCategories } from '../services/featureService';

/**
 * Custom hook to fetch and manage category/database data
 * @returns {Object} - Object containing categories, loading state, and error
 */
export function useCategoryData() {
  const [categories, setCategories] = useState(['Nuclear']); // Default value
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching categories');
        const data = await getCategories();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return { categories, isLoading, error };
} 