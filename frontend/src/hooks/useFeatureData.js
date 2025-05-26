import { useState, useEffect } from 'react';
import { getSubcategories, getFeatures } from '../services/featureService';

/**
 * Hook to fetch subcategory data based on selected databases and dataSource
 * @param {string} dataSource - "cellline" or "tcga"
 * @param {Array} selectedDatabases
 * @param {boolean} isDropdownOpen
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
      const currentStr = JSON.stringify(pendingSelection.sort());
      const lastStr = lastFetchedSelection ? JSON.stringify(lastFetchedSelection.sort()) : null;

      if (currentStr !== lastStr && pendingSelection.length > 0) {
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

/**
 * Hook to fetch feature data based on selected databases and subcategories
 * @param {string} dataSource - "cellline" or "tcga"
 * @param {Array} selectedDatabases
 * @param {Array} selectedSubcategories
 * @param {boolean} isDropdownOpen
 */
export function useFeatureData(dataSource, selectedDatabases, selectedSubcategories, isDropdownOpen) {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedParams, setLastFetchedParams] = useState(null); 
  const [pendingParams, setPendingParams] = useState(null);

  useEffect(() => {
    if (isDropdownOpen) {
      setPendingParams({
        databases: selectedDatabases,
        subcategories: selectedSubcategories
      });
    }
  }, [selectedDatabases, selectedSubcategories, isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen && pendingParams) {
      const currentParamsStr = JSON.stringify({
        databases: pendingParams.databases.sort(),
        subcategories: pendingParams.subcategories.sort()
      });

      const lastParamsStr = lastFetchedParams ? JSON.stringify({
        databases: lastFetchedParams.databases.sort(),
        subcategories: lastFetchedParams.subcategories.sort()
      }) : null;

      if (
        currentParamsStr !== lastParamsStr &&
        pendingParams.databases.length > 0 &&
        pendingParams.subcategories.length > 0
      ) {
        const fetchData = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const data = await getFeatures(dataSource, pendingParams.databases, pendingParams.subcategories);
            setFeatures(data);
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
    }
  }, [dataSource, isDropdownOpen, pendingParams, lastFetchedParams]);

  useEffect(() => {
    if (!selectedDatabases.length || !selectedSubcategories.length) {
      setFeatures([]);
      return;
    }
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFeatures(dataSource, selectedDatabases, selectedSubcategories);
        setFeatures(data);
        setLastFetchedParams({
          databases: selectedDatabases,
          subcategories: selectedSubcategories
        });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch features');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dataSource, selectedDatabases, selectedSubcategories]);

  return { features, isLoading, error };
}
