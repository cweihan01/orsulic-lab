import pandas as pd
from scipy.stats import spearmanr
from itertools import combinations

def calculate_correlations(df1: pd.DataFrame, df2: pd.DataFrame):
    """
    Given two DataFrames `df1` and `df2`, computes the correlations between each row of
    `df1` and each row of `df2`. `df1` and `df2` are assumed to have the same columns
    (50 cell lines, patient IDs, etc.) and in the same order (this function does not check).

    Currently computes the Spearman correlations/p-values using numerical values.
    In future, ANOVA correlations can be added for categorical data.

    :param df1: First column is named "Feature", second column onwards are numerical values
    :type df1: DataFrame
    :param df2: Same columns and in the same order as `df1`
    :type df2: DataFrame

    :rtype: DataFrame
    :returns: DataFrame with the following columns: feature 1, feature 2, count (number of
    non-NaN values used for the correlation), correlation, p-value
    """
    df1 = df1.set_index("Feature")
    df2 = df2.set_index("Feature")

    results = []
    # Compute Spearman correlations for each unique pair of features
    for f1_name, f1_vals in df1.iterrows():
        for f2_name, f2_vals in df2.iterrows():
            # f1_vals, f2_vals = f1_vals.align(f2_vals, axis=1, join="inner")
            valid_data = pd.concat([f1_vals, f2_vals], axis=1).dropna()
            count = valid_data.shape[0]  # Number of valid data points

            if count > 1:
                f1_valid = valid_data.iloc[:, 0]
                f2_valid = valid_data.iloc[:, 1]
                corr, p_value = spearmanr(f1_valid, f2_valid, nan_policy="omit")
                results.append([f1_name, f2_name, count, corr, p_value])

    # Convert the results into a DataFrame
    return pd.DataFrame(results, columns=["feature1", "feature2", "count", "spearman_correlation", "spearman_p_value"])
