from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("features", views.FeatureViewSet)
router.register("nuclear", views.NuclearViewSet)

urlpatterns = [
    path('', views.index, name=""),
    path('cellline', views.cellline, name="cellline"),
    path('corr', views.corr, name="corr"),
    path('api/', include(router.urls)),
    path('api/correlations/', views.CorrelationView.as_view()),
    path('api/scatter/', views.ScatterView.as_view()),
]
