from django.db import models

# Create your models here.
class GeneExpression(models.Model):
    gene = models.CharField(max_length=30)
    depmap_id = models.IntegerField()