from django.shortcuts import render
from .models import CellLine, Correlation

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

def corr(request):
        rows = Correlation.objects.all()
        columns = [col.name for col in Correlation._meta.get_fields()]
        context = {
                'correlations': rows,
                'columns': columns,
        }
        return render(request, 'database/corr.html', context)