from django.contrib import admin
from .models import Feature, Nuclear, Molecular, DrugScreen, Correlation, Feature_TCGA, Nuclear_TCGA, Molecular_TCGA, Clinical_TCGA, FracLac_TCGA

# Register your models here.
admin.site.register(Feature)
admin.site.register(Nuclear)
admin.site.register(Molecular)
admin.site.register(DrugScreen)
admin.site.register(Correlation)
admin.site.register(Feature_TCGA)
admin.site.register(Nuclear_TCGA)
admin.site.register(Molecular_TCGA)
admin.site.register(Clinical_TCGA)
admin.site.register(FracLac_TCGA)