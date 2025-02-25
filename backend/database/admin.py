from django.contrib import admin
from .models import Feature, Nuclear, Mole_GlobalChromatin, Drug_GDSC1_AUC, Correlation

# Register your models here.
admin.site.register(Feature)
admin.site.register(Nuclear)
admin.site.register(Mole_GlobalChromatin)
admin.site.register(Drug_GDSC1_AUC)
admin.site.register(Correlation)
