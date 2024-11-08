from django.db import models

class CellLine(models.Model):
    """
    Main model used to reference each cell line.
    """
    depmap_id = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=30)
    
    def __str__(self):
        return self.depmap_id

class Feature(models.Model):
    """
    Stores each feature.
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class CellLineFeatureValue(models.Model):
    """
    References each `CellLine` and each `Feature`, storing the corresponding feature.
    """
    cellline = models.ForeignKey(CellLine, on_delete=models.CASCADE)
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE)
    value = models.FloatField()

    def __str__(self):
        return self.cellline.depmap_id + ": " + self.feature.name
