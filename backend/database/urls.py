from django.urls import path
from . import views

urlpatterns = [

    path('', views.index, name=""),
    path('cellline', views.cellline, name="cellline"),
    path('corr', views.corr, name="corr"),

]