import pandas as pd
import numpy as np
import math
from scipy.stats import spearmanr, f_oneway
from database.models import Feature
import warnings

def calculate_correlations(df1: pd.DataFrame, df2: pd.DataFrame):
    """
    Given two DataFrames `df1` and `df2`, computes the correlations between each row of
    `df1` and each row of `df2`. `df1` and `df2` are assumed to have the same columns
    (50 cell lines, patient IDs, etc.) and in the same order (this function does not check).

    Currently computes the Spearman correlations/p-values using numerical values.
    In future, ANOVA correlations can be added for categorical data.

    :param df1: First column is named "Database", second column, "Feature", third column and onwards are numerical values
    :type df1: DataFrame
    :param df2: Same columns and in the same order as `df1`
    :type df2: DataFrame

    :rtype: DataFrame
    :returns: DataFrame with the following columns: feature1, feature2, count (number of
    non-NaN values used for the correlation), correlation, p-value
    """
    # Set a multi-index based on "Database" and "Feature"
    df1 = df1.set_index(["Database", "Feature"])
    df2 = df2.set_index(["Database", "Feature"])

    feature_type_map = {
        feature.name: feature.data_type
        for feature in Feature.objects.all()
    }

    results = []
    # Compute Spearman correlations for each unique pair of features across databases
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        for (db1, f1_name), f1_vals in df1.iterrows():
            for (db2, f2_name), f2_vals in df2.iterrows():
                f1_type = feature_type_map.get(f1_name)
                f2_type = feature_type_map.get(f2_name)
                
                if f1_type == "cat" and f2_type == "cat":
                    continue

                valid_data = pd.concat([f1_vals, f2_vals], axis=1).dropna()
                count = valid_data.shape[0]  # Number of valid data points

                if count < 3:
                    continue

                f1_valid = valid_data.iloc[:, 0]
                f2_valid = valid_data.iloc[:, 1]

                # Case 1: Both numerical → Spearman
                if f1_type == "num" and f2_type == "num":
                    spearman_corr, spearman_p_value = spearmanr(f1_valid, f2_valid, nan_policy = "omit")
                    anova_p_value = None

                    # Reject null and nan values
                    if (spearman_corr is not None and math.isfinite(spearman_corr)) and (spearman_p_value is not None and math.isfinite(spearman_p_value)):
                        results.append([db1, f1_name, db2, f2_name, count, spearman_corr, spearman_p_value, anova_p_value])

                # Case 2: One categorical, one numerical → ANOVA
                elif f1_type == "cat" and f2_type == "num":
                    groups = [f2_valid[f1_valid == cat] for cat in f1_valid.unique()]
                    if len(groups) > 1:
                        _, anova_p_value = f_oneway(*groups)
                        spearman_corr = spearman_p_value = None

                elif f1_type == "num" and f2_type == "cat":
                    groups = [f1_valid[f2_valid == cat] for cat in f2_valid.unique()]
                    if len(groups) > 1:
                        _, anova_p_value = f_oneway(*groups)
                        spearman_corr = spearman_p_value = None
                
                # Reject null and nan values
                if anova_p_value is not None and math.isfinite(anova_p_value):
                    results.append([db1, f1_name, db2, f2_name, count, spearman_corr, spearman_p_value, anova_p_value])

    # Convert the results into a DataFrame
    return pd.DataFrame(results, columns=["database1", "feature1",  "database2", "feature2", "count", 
                                          "spearman_correlation", "spearman_p_value", "anova_p_value"])

# 
def get_feature_values(db_dict: dict, CELL_LINES) -> pd.DataFrame: 
    """
    Given a `db_dict` and `CELL_LINES`, convert the pandas Dataframe, where the rows correspond to database/feature pairs
    and the values of the corresponding cell lines

    :param db_dict: dictionary object where the keys are the names of the databases and the values are query set objects
    :param CELL_LINES: Cell lines list from models.py
    """
    df_list = []

    # print(db_dict.keys())
    for key in db_dict.keys():
        print(f"Key: {key}")
        tmp_queryset = db_dict[key].values_list()
        if len(tmp_queryset) == 0:
            continue
        
        # Converting to a dataframe
        tmp_df = pd.DataFrame(list(tmp_queryset), columns=["Feature", *CELL_LINES])

        # Adding the database information to the row
        tmp_df["Database"] = key
        
        # Moving it so that its the first column
        col = tmp_df.pop('Database')
        tmp_df.insert(0, "Database", col)


        df_list.append(tmp_df)

    # Combine all the dataframes in the list
    df = pd.concat(df_list, ignore_index=True)

    # Filtering the columns where the values for CELL_LINE are 0
    df_filtered = df.loc[~(df[CELL_LINES] == 0).all(axis=1)]
    return df_filtered