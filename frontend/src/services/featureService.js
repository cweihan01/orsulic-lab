import axios from 'axios';

/**
 * Get all categories/databases (only for cell line by default)
 * @returns {Promise} Promise resolving to array of categories
 */
export const getCategories = async (dataSource) => {
    const endpoint = dataSource === 'tcga' ? 'features_tcga/categories' : 'features/categories';
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ROOT}${endpoint}`);
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

/**
 * Get subcategories for selected categories
 * @param {string} dataSource - 'cellline' or 'tcga'
 * @param {Array} categories - Selected categories
 * @returns {Promise} Promise resolving to array of subcategories
 */
export const getSubcategories = async (dataSource, categories) => {
    if (!categories || categories.length === 0) {
        return [];
    }

    const endpoint =
        dataSource === 'tcga'
            ? `${process.env.REACT_APP_API_ROOT}features_tcga/subcategories/`
            : `${process.env.REACT_APP_API_ROOT}features/subcategories/`;

    try {
        const response = await axios.get(endpoint, {
            params: { categories },
            paramsSerializer: () => {
                return categories
                    .map((db) => `categories=${encodeURIComponent(db)}`)
                    .join('&');
            },
        });
        return response.data.subcategories || [];
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
    }
};

/**
 * Get features based on selected databases and subcategories
 * @param {string} dataSource - 'cellline' or 'tcga'
 * @param {Array} databaseList - Selected databases/categories
 * @param {Array} subCategoryList - Selected subcategories
 * @returns {Promise} Promise resolving to array of feature names
 */
export const getFeatures = async (dataSource, databaseList, subCategoryList) => {
    if (
        !databaseList || databaseList.length === 0 ||
        !subCategoryList || subCategoryList.length === 0
    ) {
        return [];
    }

    const endpoint =
        dataSource === 'tcga'
            ? `${process.env.REACT_APP_API_ROOT}features_tcga/`
            : `${process.env.REACT_APP_API_ROOT}features/`;

    try {
        const response = await axios.get(endpoint, {
            params: { databaseList, subCategoryList },
            paramsSerializer: () => {
                const dbParams = databaseList
                    .map((db) => `databaseList=${encodeURIComponent(db)}`);
                const subCatParams = subCategoryList
                    .map((subCat) => `subCategoryList=${encodeURIComponent(subCat)}`);
                return [...dbParams, ...subCatParams].join('&');
            },
        });
        return response.data.map((feature) => feature.name);
    } catch (error) {
        console.error('Error fetching features:', error);
        return [];
    }
};
