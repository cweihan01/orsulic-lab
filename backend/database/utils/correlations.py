import math
import pandas as pd
import warnings
from scipy.stats import spearmanr, f_oneway, chi2_contingency

from .constants import CELL_LINES


def _round_to_n(x, n):
    """Round to n significant digits."""
    if x == 0:
        return x
    else:
        return round(x, -int(math.floor(math.log10(abs(x)))) + (n - 1))


def calculate_correlations(df1: pd.DataFrame, df2: pd.DataFrame):
    """
    Given two DataFrames `df1` and `df2`, computes the correlations between each row of
    `df1` and each row of `df2`. `df1` and `df2` are assumed to have the same columns
    (50 cell lines, patient IDs, etc.) and in the same order (this function does not check).

    Currently computes the Spearman/ANOVA/Chi-Square correlations/p-values.
    The appropriate type is chosen based on the datatype of each feature.

    :param df1: First column is named "Database", second column "Feature",
    third column "subcategory", fourth column "datatype", fifth column onwards are values
    :type df1: DataFrame

    :param df2: Same columns and in the same order as `df1`
    :type df2: DataFrame

    :rtype: DataFrame
    :returns: DataFrame with the following columns:
    database_1, subcategory_1, feature_1, database_2, subcategory_2, feature_2,
    count (number of non-NaN values used for the correlation),
    <type>_correlation (if applicable), <type>_p-value
    """
    # Set a multi-index based on first four columns
    df1 = df1.set_index(["database", "feature", "subcategory", "datatype"])
    df2 = df2.set_index(["database", "feature", "subcategory", "datatype"])

    spearman_results = []
    anova_results = []
    chisq_results = []

    # Compute Spearman correlations for each unique pair of features across databases
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        # Outer loop only runs once since correlating one feature against many
        for (db1, f1_name, f1_subcategory, f1_type), f1_vals in df1.iterrows():
            # Inner loop runs as many times as there are features
            for (db2, f2_name, f2_subcategory, f2_type), f2_vals in df2.iterrows():

                valid_data = pd.concat([f1_vals, f2_vals], axis=1).dropna()
                count = valid_data.shape[0]  # Number of valid data points

                if count < 3:
                    continue

                f1_valid = valid_data.iloc[:, 0]
                f2_valid = valid_data.iloc[:, 1]

                spearman_corr = spearman_pvalue = None
                anova_pvalue = None
                chisq_pvalue = None

                # Spearman: both numerical
                if f1_type == "num" and f2_type == "num":
                    spearman_corr, spearman_pvalue = spearmanr(
                        f1_valid, f2_valid, nan_policy="omit")

                    # Reject null and nan values
                    if (spearman_corr is not None and math.isfinite(spearman_corr)) and (spearman_pvalue is not None and math.isfinite(spearman_pvalue)):
                        spearman_corr = _round_to_n(spearman_corr, 3)
                        spearman_pvalue = _round_to_n(spearman_pvalue, 3)
                        spearman_results.append(
                            [db1, f1_subcategory, f1_name, db2, f2_subcategory, f2_name, count, spearman_corr, spearman_pvalue])

                # ANOVA: one categorical, one numerical
                elif (f1_type == "cat" and f2_type == "num") or (f1_type == "num" and f2_type == "cat"):
                    if f1_type == "cat":
                        groups = [f2_valid[f1_valid == cat] for cat in f1_valid.unique()]
                    else:
                        groups = [f1_valid[f2_valid == cat] for cat in f2_valid.unique()]

                    if len(groups) > 1:
                        try:
                            _, anova_pvalue = f_oneway(*groups)
                            if anova_pvalue is not None and math.isfinite(anova_pvalue):
                                anova_pvalue = _round_to_n(anova_pvalue, 3)
                                anova_results.append(
                                    [db1, f1_subcategory, f1_name, db2, f2_subcategory, f2_name, count, anova_pvalue])
                        except:
                            continue

                # Chi-squared: both categorical
                elif f1_type == "cat" and f2_type == "cat":
                    contingency_table = pd.crosstab(f1_valid, f2_valid)
                    if contingency_table.shape[0] > 1 and contingency_table.shape[1] > 1:
                        try:
                            _, chisq_pvalue, _, _ = chi2_contingency(contingency_table)
                            if chisq_pvalue is not None and math.isfinite(chisq_pvalue):
                                chisq_pvalue = _round_to_n(chisq_pvalue, 3)
                                chisq_results.append(
                                    [db1, f1_subcategory, f1_name, db2, f2_subcategory, f2_name, count, chisq_pvalue])
                        except:
                            continue

    return {
        "spearman": pd.DataFrame(
            spearman_results,
            columns=["database_1", "subcategory_1", "feature_1", "database_2",
                     "subcategory_2", "feature_2", "count",
                     "spearman_correlation", "spearman_pvalue"]
        ),
        "anova": pd.DataFrame(
            anova_results,
            columns=["database_1", "subcategory_1", "feature_1", "database_2",
                     "subcategory_2", "feature_2", "count", "anova_pvalue"]
        ),
        "chisquared": pd.DataFrame(
            chisq_results,
            columns=["database_1", "subcategory_1", "feature_1", "database_2",
                     "subcategory_2", "feature_2", "count", "chisq_pvalue"]
        )
    }


def get_feature_values(db_dict: dict, feature_to_subcategory: dict, feature_to_datatype: dict) -> pd.DataFrame:
    """
    Given a `db_dict`, return a pandas DataFrame containing the database, subcategory, 
    feature, datatype and each of the corresponding cell lines.

    :param db_dict: dictionary mapping each database (Nuclear, Molecular, Drug Screen)
    to its corresponding QuerySet objects

    :param feature_to_subcategory: dictionary mapping each feature to its subcategory
    :param feature_to_datatype: dictionary mapping each feature to its data type (num, cat)
    """
    df_list = []

    for key in db_dict.keys():
        tmp_queryset = db_dict[key].values_list()
        if len(tmp_queryset) == 0:
            continue

        # Converting to a dataframe
        tmp_df = pd.DataFrame(list(tmp_queryset), columns=["feature", *CELL_LINES])

        # Adding the database information to the row
        tmp_df["database"] = key

        tmp_df["subcategory"] = tmp_df["feature"].map(feature_to_subcategory)
        tmp_df["datatype"] = tmp_df["feature"].map(feature_to_datatype)

        # Moving it so that its the first column
        col = tmp_df.pop('database')
        tmp_df.insert(0, "database", col)

        df_list.append(tmp_df)

    # Combine all the dataframes in the list
    df = pd.concat(df_list, ignore_index=True)

    # Filtering the columns where the values for CELL_LINE are 0
    df_filtered = df.loc[~(df[CELL_LINES] == 0).all(axis=1)]
    return df_filtered
