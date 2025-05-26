import { useState, useEffect } from 'react';
import { getSubcategories } from '../services/featureService';

/**
 * Custom hook to fetch and manage subcategory data based on selected databases
 * @param {string} dataSource - 'cellline' or 'tcga'
 * @param {Array} selectedDatabases - Array of selected database/category names
 * @param {boolean} isDropdownOpen - Whether the related dropdown is currently open
 */
export function useSubcategoryData(dataSource, selectedDatabases, isDropdownOpen) {
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedSelection, setLastFetchedSelection] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);

  useEffect(() => {
    if (isDropdownOpen) {
      setPendingSelection(selectedDatabases);
    }
  }, [selectedDatabases, isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen && pendingSelection) {
      const currentSelectionStr = JSON.stringify(pendingSelection.sort());
      const lastSelectionStr = lastFetchedSelection ? JSON.stringify(lastFetchedSelection.sort()) : null;

      if (currentSelectionStr !== lastSelectionStr && pendingSelection.length > 0) {
        const fetchData = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const data = await getSubcategories(dataSource, pendingSelection);
            setSubcategories(data);
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
  }, [dataSource, isDropdownOpen, pendingSelection, lastFetchedSelection, selectedDatabases.length]);

  useEffect(() => {
    if (!selectedDatabases || selectedDatabases.length === 0) {
      setSubcategories([]);
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSubcategories(dataSource, selectedDatabases);
        setSubcategories(data);
        setLastFetchedSelection(selectedDatabases);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch subcategories');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dataSource, selectedDatabases]);

  return { subcategories, isLoading, error };
}
