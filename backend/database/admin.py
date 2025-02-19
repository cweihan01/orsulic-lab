from django.contrib import admin
from .models import Nuclear, Feature, Mole_GlobalChromatin, Correlation

# Register your models here.
admin.site.register(Nuclear)
admin.site.register(Feature)
admin.site.register(Mole_GlobalChromatin)
admin.site.register(Correlation)
