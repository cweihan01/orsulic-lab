from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("features", views.FeatureViewSet)
router.register("nuclear", views.NuclearViewSet)
router.register("molecular", views.MolecularViewSet)
router.register("drugscreen", views.DrugScreenViewSet)
router.register("features_tcga", views.FeatureTCGAViewSet)
router.register("nuclear_tcga", views.NuclearTCGAViewSet)
router.register("molecular_tcga", views.MolecularTCGAViewSet)
router.register("clinical_tcga", views.ClinicalTCGAViewSet)
router.register("fraclac_tcga", views.FracLacTCGAViewSet)
router.register("doberstein_tcga", views.DobersteinTCGAViewSet)

urlpatterns = [
    path('', views.index, name=""),
    path('cellline', views.cellline, name="cellline"),
    path('corr', views.corr, name="corr"),
    path('api/', include(router.urls)),
    path('api/correlations/', views.CorrelationView.as_view()),
    path('api/scatter/', views.ScatterView.as_view()),
    path('api/correlations_tcga/', views.CorrelationTCGAView.as_view()),
    path('api/scatter_tcga/', views.ScatterTCGAView.as_view()),
]
