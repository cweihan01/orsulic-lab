from django.shortcuts import render
from rest_framework import viewsets
from .models import Feature, CellLine
from .serializers import FeatureSerializer, CellLineSerializer


# Create your views here.
def index(request):
    return render(request, 'database/index.html')

def cellline(request):
    rows = CellLine.objects.all()
    columns = [col.name for col in CellLine._meta.get_fields()]
    context = {
        'features': rows,
        'columns': columns,
    }
    return render(request, 'database/cellline.html', context)


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

class CellLineViewSet(viewsets.ModelViewSet):
    queryset = CellLine.objects.all()
    serializer_class = CellLineSerializer
