from django.db import models

from .utils.constants import CELL_LINES


class Feature(models.Model):
    """
    Stores each feature.
    """
    name = models.CharField(max_length=200, primary_key=True)
    data_type = models.CharField(max_length=3,
                                 choices=[("num", "Numerical"),
                                          ("cat", "Categorical")],
                                 default="num")
    category = models.CharField(max_length=20,
                                choices=[("Nuclear", "Nuclear"),
                                         ("Molecular", "Molecular"),
                                         ("Drug Screen", "Drug Screen")],
                                default="Molecular")
    sub_category = models.CharField(max_length=100, default="NA")

    def __str__(self):
        return f"{self.name}"


def create_model(model_name) -> models.Model:
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
    feature1 = models.ForeignKey(
        Feature, on_delete=models.CASCADE, related_name="feature1")
    feature2 = models.ForeignKey(
        Feature, on_delete=models.CASCADE, related_name="feature2")
    count = models.IntegerField(default=0)
    spearman_corr = models.FloatField(default=0)
    spearman_pvalue = models.FloatField(default=0)

    class Meta:
        unique_together = ("feature1", "feature2")

    def __str__(self):
        return f"Correlation between {self.feature1.name} and {self.feature2.name}"
