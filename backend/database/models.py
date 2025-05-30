from django.db import models

from .utils.constants import CELL_LINES, PATIENTS


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


def create_cellline_model(model_name) -> models.Model:
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
Nuclear = create_cellline_model('Nuclear')
Molecular = create_cellline_model('Molecular')
DrugScreen = create_cellline_model("DrugScreen")


class Feature_TCGA(models.Model):
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
                                         ("Clinical", "Clinical"),
                                         ("FracLac", "FracLac")],
                                default="Molecular")
    sub_category = models.CharField(max_length=100, default="NA")

    def __str__(self):
        return f"{self.name}"
    

def create_tcga_model(model_name) -> models.Model:
    """
    Create models dynamically.
    Each model will have a feature as primary key and float fields for each cell line.
    """
    attrs = {
        "__module__": __name__,
        'feature': models.OneToOneField(Feature_TCGA, on_delete=models.CASCADE, primary_key=True),
    }

    for patient in PATIENTS:
        attrs[patient] = models.FloatField(null=True, blank=True)

    attrs['__str__'] = lambda self: self.feature.name

    return type(model_name, (models.Model,), attrs)


# Create models
Nuclear_TCGA = create_tcga_model('Nuclear_TCGA')
FracLac_TCGA = create_tcga_model("FracLac_TCGA")


class Clinical_TCGA(models.Model):

    feature = models.OneToOneField(Feature_TCGA, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return self.feature.name
    
for patient in PATIENTS:
    Clinical_TCGA.add_to_class(patient, models.CharField(max_length=50, null=True, blank=True))


class Molecular_TCGA(models.Model):

    feature = models.OneToOneField(Feature_TCGA, on_delete=models.CASCADE, primary_key=True)

    def __str__(self):
        return self.feature.name
    
for patient in PATIENTS:
    Molecular_TCGA.add_to_class(patient, models.CharField(max_length=50, null=True, blank=True))


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
