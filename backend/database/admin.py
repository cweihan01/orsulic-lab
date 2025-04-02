from django.contrib import admin
from .models import Feature, Nuclear, Molecular, DrugScreen, Correlation

# Register your models here.
admin.site.register(Feature)
admin.site.register(Nuclear)
admin.site.register(Molecular)
admin.site.register(DrugScreen)
admin.site.register(Correlation)
