from django.db import models

CELL_LINES = [
    "ACH-001278",
    "ACH-001042",
    "ACH-001048",
    "ACH-001063",
    "ACH-000574",
    "ACH-002140",
    "ACH-000542",
    "ACH-000116",
    "ACH-002181",
    "ACH-002182",
    "ACH-000617",
    "ACH-001151",
    "ACH-000646",
    "ACH-000409",
    "ACH-001630",
    "ACH-001632",
    "ACH-000460",
    "ACH-001403",
    "ACH-001628",
    "ACH-000256",
    "ACH-000608",
    "ACH-000123",
    "ACH-000278",
    "ACH-000704",
    "ACH-000657",
    "ACH-000091",
    "ACH-000688",
    "ACH-000885",
    "ACH-000048",
    "ACH-000291",
    "ACH-001374",
    "ACH-000906",
    "ACH-001418",
    "ACH-000696",
    "ACH-000001",
    "ACH-000713",
    "ACH-000811",
    "ACH-000719",
    "ACH-000701",
    "ACH-000524",
    "ACH-000430",
    "ACH-000796",
    "ACH-000527",
    "ACH-000443",
    "ACH-000663",
    "ACH-002149",
    "ACH-000324",
    "ACH-000132",
    "ACH-000237",
    "ACH-000947"
]


class Feature(models.Model):
    """
    Stores each feature.
    """
    name = models.CharField(max_length=100, primary_key=True)
    data_type = models.CharField(max_length=3, choices=[("num", "Numerical"), ("cat", "Categorical")], default="num")
    # TODO:
    # store type (image, clinical, etc)
    # store data type (numerical or categorical)
    # use id as primary key - features may have the same names

    def __str__(self):
        return self.name


class Nuclear(models.Model):
    """
    Schema: First column is feature_name (primary key), 
            subsequent columns correspond to each cell line
    """
    feature = models.OneToOneField(Feature, on_delete=models.CASCADE, primary_key=True)

    for cellline in CELL_LINES:
        locals()[cellline] = models.FloatField(default=0)

    def __str__(self):
        return self.feature.name
    
class Correlation(models.Model):
    """

    Schema:

    """
    feature1 = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name="feature1")
    feature2 = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name="feature2")
    count = models.IntegerField(default=0)
    spearman_corr = models.FloatField(default=0)
    spearman_pvalue = models.FloatField(default=0)

    class Meta:
        unique_together = ("feature1", "feature2")

    def __str__(self):
        return f"Correlation between {self.feature1.name} and {self.feature2.name}"
