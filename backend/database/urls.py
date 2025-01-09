from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'features', views.FeatureViewSet)
router.register(r'celllines', views.CellLineViewSet)

urlpatterns = [
    path('', views.index, name=""),
    path('cellline', views.cellline, name="cellline"),
    path('api/', include(router.urls)),
]