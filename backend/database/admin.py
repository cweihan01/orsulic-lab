from django.contrib import admin
from .models import CellLine, Feature, CellLineFeatureValue

# Register your models here.
admin.site.register(CellLine)
admin.site.register(Feature)
admin.site.register(CellLineFeatureValue)
