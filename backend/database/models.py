from django.db import models

CELL_LINES = [
    "ACH-000657", "ACH-001278", "ACH-000713", "ACH-001042", "ACH-000256", 
    "ACH-000278", "ACH-000123", "ACH-001048", "ACH-000608", "ACH-001063", 
    "ACH-000906", "ACH-000574", "ACH-000542", "ACH-002140", "ACH-000324",
    "ACH-000237", "ACH-000132", "ACH-002149", "ACH-000524", "ACH-000796",
    "ACH-000001", "ACH-000116", "ACH-000704", "ACH-000091", "ACH-000688",
    "ACH-000291", "ACH-002181", "ACH-002182", "ACH-000617", "ACH-001151",
    "ACH-000696", "ACH-000527", "ACH-000947", "ACH-000443", "ACH-000646",
    "ACH-000409", "ACH-000663", "ACH-001374", "ACH-001628", "ACH-001630",
    "ACH-001632", "ACH-000719", "ACH-000701", "ACH-000811", "ACH-000460",
    "ACH-001403", "ACH-000048", "ACH-000885", "ACH-000430", "ACH-001418"
]


class Feature(models.Model):
    """
    Stores each feature.
    """
    name = models.CharField(max_length=150, primary_key=True)
    data_type = models.CharField(max_length=3, choices=[("num", "Numerical"), ("cat", "Categorical")], default="num")
    category = models.CharField(max_length=20, choices=[("Nuclear", "Nuclear"), 
                                                        ("Molecular", "Molecular"), 
                                                        ("Drug Screen", "Drug Screen")], 
                                                        default="Molecular")
    sub_category = models.CharField(max_length=100, default="NA")

    def __str__(self):
        return f"{self.name}"


def create_model(model_name):
    """
    Create models dynamically.
    Each model will have a feature as primary key and float fields for each cell line.
    """
    attrs = {
        "__module__": __name__,
        'feature': models.OneToOneField(Feature, on_delete=models.CASCADE, primary_key=True),
    }

    for cell_line in CELL_LINES:
        attrs[cell_line] = models.FloatField(null=True, blank=True)

    attrs['__str__'] = lambda self: self.feature.name

    return type(model_name, (models.Model,), attrs)


# Create models
Nuclear = create_model('Nuclear')
Molecular = create_model('Molecular')
DrugScreen = create_model("DrugScreen")
    
    
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
