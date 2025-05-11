import axios from 'axios';

/**
 * Get all categories/databases
 * @returns {Promise} Promise resolving to array of categories
 */
export const getCategories = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_ROOT}features/categories`);
        return response.data.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

/**
 * Get subcategories for selected categories
 * @param {Array} categories - Selected categories
 * @returns {Promise} Promise resolving to array of subcategories
 */
export const getSubcategories = async (categories) => {
    if (!categories || categories.length === 0) {
        return [];
    }

    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_ROOT}features/subcategories/`, 
            {
                params: { categories },
                paramsSerializer: (params) => {
                    return categories
                        .map((db) => `categories=${encodeURIComponent(db)}`)
                        .join('&');
                },
            }
        );
        return response.data.subcategories;
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
    }
};

/**
 * Get features based on selected databases and subcategories
 * @param {Array} databaseList - Selected databases/categories
 * @param {Array} subCategoryList - Selected subcategories
 * @returns {Promise} Promise resolving to array of feature names
 */
export const getFeatures = async (databaseList, subCategoryList) => {
    if (!databaseList || databaseList.length === 0 || !subCategoryList || subCategoryList.length === 0) {
        return [];
    }

    try {
        const response = await axios.get(
            `${process.env.REACT_APP_API_ROOT}features/`, 
            {
                params: { databaseList, subCategoryList },
                paramsSerializer: (params) => {
                    const dbParams = databaseList
                        .map((db) => `databaseList=${encodeURIComponent(db)}`);
                    const subCatParams = subCategoryList
                        .map((subCat) => `subCategoryList=${encodeURIComponent(subCat)}`);
                    return [...dbParams, ...subCatParams].join('&');
                },
            }
        );
        return response.data.map((feature) => feature.name);
    } catch (error) {
        console.error('Error fetching features:', error);
        return [];
    }
}; 