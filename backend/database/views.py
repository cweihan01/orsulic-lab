import pandas as pd
import traceback
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Feature, Nuclear, CELL_LINES, Correlation
from .serializers import FeatureSerializer, NuclearSerializer

from .utils import correlations


def index(request):
    return render(request, 'database/index.html')


def cellline(request):
    rows = Nuclear.objects.all()
    columns = [col.name for col in Nuclear._meta.get_fields()]
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


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer


class NuclearViewSet(viewsets.ModelViewSet):
    queryset = Nuclear.objects.all()
    serializer_class = NuclearSerializer


class CorrelationView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Extract input features from the request body
            # f1, f2 refer to feature 1/2
            f1_name = request.data.get("feature1")
            f2_names = request.data.get("feature2")

            # Ensure input features are provided
            if not f1_name:
                return Response({"error": "Feature 1 is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not f2_names:
                return Response({"error": "Feature 2 is required (can be a single feature or a list)."}, status=status.HTTP_400_BAD_REQUEST)

            # Convert f2_names to a list if necessary
            if isinstance(f2_names, str):
                f2_names = [f2_names]

            # Fetch Feature objects
            try:
                feature1 = Feature.objects.get(name=f1_name)
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f1_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            f2_objects = Feature.objects.filter(name__in=f2_names)
            if not f2_objects.exists():
                return Response({"error": f"None of the provided features in Feature 2 were found: {f2_names}."}, status=status.HTTP_404_NOT_FOUND)

            # Query Nuclear table using the retrieved Features
            f1_data = Nuclear.objects.filter(feature=feature1)
            f2_data = Nuclear.objects.filter(feature__in=f2_objects)
            if not f1_data.exists() or not f2_data.exists():
                return Response({"error": "No cell line data found for the specified features."}, status=status.HTTP_404_NOT_FOUND)

            # Convert Nuclear data into dataframes
            f1_queryset = f1_data.values_list()
            f2_queryset = f2_data.values_list()
            f1_df = pd.DataFrame(list(f1_queryset), columns=["Feature", *CELL_LINES])
            f2_df = pd.DataFrame(list(f2_queryset), columns=["Feature", *CELL_LINES])

            # print("Feature 1 df:")
            # print(f1_df)
            # print("Feature 2 df:")
            # print(f2_df)

            # Calculate correlations
            results_df = correlations.calculate_correlations(f1_df, f2_df)

            # Convert the results DataFrame to a JSON-compatible format
            results_json = results_df.to_dict(orient="records")

            print("Results JSON:", results_json)

            return Response({"correlations": results_json}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error:", traceback.format_exc())
            return Response({"Error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ScatterView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Extract input features from the request body
            f1_name = request.data.get("feature1")
            f2_name = request.data.get("feature2")  # Change to single value

            # Ensure input features are provided
            if not f1_name:
                return Response({"error": "Feature 1 is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not f2_name:  # Check for single value
                return Response({"error": "Feature 2 is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch Feature objects
            try:
                feature1 = Feature.objects.get(name=f1_name)
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f1_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            try:
                feature2 = Feature.objects.get(name=f2_name)  # Fetch single feature
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f2_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            # Query CellLine table using the retrieved Features
            f1_data = Nuclear.objects.filter(feature=feature1)
            f2_data = Nuclear.objects.filter(feature=feature2)  # Use single feature
            if not f1_data.exists() or not f2_data.exists():
                return Response({"error": "No cell line data found for the specified features."}, status=status.HTTP_404_NOT_FOUND)

            # Convert CellLine data into dataframes
            f1_queryset = f1_data.values_list()
            f2_queryset = f2_data.values_list()
            f1_df = pd.DataFrame(list(f1_queryset), columns=["Feature", *CELL_LINES])
            f2_df = pd.DataFrame(list(f2_queryset), columns=["Feature", *CELL_LINES])

            # Merge the two DataFrames by column
            merged_df = pd.concat([f1_df, f2_df], axis=0)

            print("Merged DataFrame:")
            print(merged_df.head(5))

            # Transpose the merged DataFrame
            transposed_df = merged_df.T.reset_index()
            transposed_df.columns = ["cell_lines"] + [f"{f1_name}", f"{f2_name}"]  # Rename columns

            # Remove redundnant first row
            transposed_df = transposed_df.iloc[1:].reset_index(drop=True)

            # print("Transposed DataFrame:")
            # print(transposed_df.head(5))

            # Convert the transposed DataFrame to a JSON-compatible format
            transposed_json = transposed_df.to_dict(orient="records")

            return Response({"scatter_data": transposed_json}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error:", traceback.format_exc())
            return Response({"Error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)