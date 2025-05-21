import json
import hashlib
import pandas as pd
import traceback

from django.shortcuts import render
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Feature, Nuclear, Molecular, DrugScreen, Correlation
from .serializers import FeatureSerializer, NuclearSerializer, MolecularSerializer, DrugScreenSerializer
from .utils import correlations
from .utils.constants import CELL_LINES, CACHE_DURATION


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

    # Get the categories with /api/features/categories/
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Feature.objects.values_list('category', flat=True).distinct()
        return Response({'categories': list(categories)})

    # Get subcategories for multiple categories with /api/features/subcategories/?categories=Nuclear&categories=Drug%20Screen
    @action(detail=False, methods=['get'])
    def subcategories(self, request):
        categories = request.query_params.getlist('categories')

        # print("Categories received:", categories)

        if not categories:
            return Response({'error': 'Categories parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        subcategories = Feature.objects.filter(category__in=categories)\
            .values_list('sub_category', flat=True)\
            .distinct()

        return Response({'subcategories': list(subcategories)})

    def list(self, request, *args, **kwargs):
        # Get database list and sub_category list from query parameters
        database_list = request.query_params.getlist('databaseList', [])
        sub_category_list = request.query_params.getlist('subCategoryList', [])

        # Apply filters if parameters are provided
        if database_list:
            self.queryset = self.queryset.filter(category__in=database_list)

        if sub_category_list:
            self.queryset = self.queryset.filter(sub_category__in=sub_category_list)

        print(self.queryset)

        return super().list(request, *args, **kwargs)


class NuclearViewSet(viewsets.ModelViewSet):
    queryset = Nuclear.objects.all()
    serializer_class = NuclearSerializer


class MolecularViewSet(viewsets.ModelViewSet):
    queryset = Molecular.objects.all()
    serializer_class = MolecularSerializer


class DrugScreenViewSet(viewsets.ModelViewSet):
    queryset = DrugScreen.objects.all()
    serializer_class = DrugScreenSerializer


class CorrelationView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Extract input features from the request body
            # f1, f2 refer to feature 1/2
            f1_name = request.data.get("feature1")
            f2_names = request.data.get("feature2")

            # Extract database names for feature 1 and features 2
            db1_names = request.data.get("database1")
            db2_names = request.data.get("database2")

            # Ensure input features are provided
            if not f1_name:
                return Response({"error": "Feature 1 is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not f2_names:
                return Response({"error": "Feature 2 is required (can be a single feature or a list)."}, status=status.HTTP_400_BAD_REQUEST)

            if not db1_names:
                return Response({"error": "Database 1 is required (can be a single feature or a list)."}, status=status.HTTP_400_BAD_REQUEST)
            if not db2_names:
                return Response({"error": "Database 1 is required (can be a single feature or a list)."}, status=status.HTTP_400_BAD_REQUEST)

            # Convert f2_names to a list if necessary
            if isinstance(f2_names, str):
                f2_names = [f2_names]

            # Convert db1 and 2 names to list if necessary
            if isinstance(db1_names, str):
                db1_names = [db1_names]

            if isinstance(db2_names, str):
                db2_names = [db2_names]

            # Prepare key for cache
            key_data = {
                "f1": f1_name,
                "f2": sorted(f2_names),
                "db1": sorted(db1_names),
                "db2": sorted(db2_names),
            }
            key_json = json.dumps(key_data, separators=(",", ":"), sort_keys=True)
            cache_key = "corr:" + hashlib.md5(key_json.encode("utf-8")).hexdigest()

            # Retrieve correlation from cache if possible
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return Response({"correlations": cached_result}, status=status.HTTP_200_OK)

            # Fetch Feature objects for feature 1
            try:
                f1_object = Feature.objects.get(name=f1_name)
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f1_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            # Fetch Feature objects for features 2
            f2_objects = Feature.objects.filter(name__in=f2_names)
            if not f2_objects.exists():
                return Response({"error": f"None of the provided features in Feature 2 were found: {f2_names}."}, status=status.HTTP_404_NOT_FOUND)

            f1_data = {}
            for db_name in db1_names:
                if db_name == "Nuclear":
                    f1_data["Nuclear"] = Nuclear.objects.filter(feature=f1_object)
                elif db_name == "Molecular":
                    f1_data["Molecular"] = Molecular.objects.filter(
                        feature=f1_object).values_list()
                elif db_name == "Drug Screen":
                    f1_data["Drug Screen"] = DrugScreen.objects.filter(
                        feature=f1_object).values_list()

            f2_data = {}
            for db_name in db2_names:
                if db_name == "Nuclear":
                    f2_data["Nuclear"] = Nuclear.objects.filter(feature__in=f2_objects)
                elif db_name == "Molecular":
                    f2_data["Molecular"] = Molecular.objects.filter(
                        feature__in=f2_objects).values_list()
                elif db_name == "Drug Screen":
                    f2_data["Drug Screen"] = DrugScreen.objects.filter(
                        feature__in=f2_objects).values_list()

            # Map each feature (in current query) to its sub_category
            feature_to_subcategory = {
                f.name: f.sub_category for f in f2_objects
            }
            feature_to_subcategory[f1_object.name] = f1_object.sub_category

            # Map each feature (in current query) to its data_type (num, cat)
            feature_to_datatype = {
                f.name: f.data_type for f in f2_objects
            }
            feature_to_datatype[f1_object.name] = f1_object.data_type

            f1_df = correlations.get_feature_values(
                f1_data, feature_to_subcategory, feature_to_datatype)
            f2_df = correlations.get_feature_values(
                f2_data, feature_to_subcategory, feature_to_datatype)

            # print("Feature 1 df:")
            # print(f1_df.head(5))
            # print("Feature 2 df:")
            # print(f2_df.head(5))

            # Call the updated calculate_correlations function
            results_df_dict = correlations.calculate_correlations(f1_df, f2_df)

            # Convert each DataFrame in the dict to a list of records
            results_json = {
                key: df.to_dict(orient="records")
                for key, df in results_df_dict.items()
            }

            # Save correlation results to cache
            cache.set(cache_key, results_json, timeout=CACHE_DURATION)
            return Response({"correlations": results_json}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error:", traceback.format_exc())
            return Response({"Error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ScatterView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Extract input features from the request body
            f1_name = request.data.get("feature1")
            f2_name = request.data.get("feature2")

            db1_name = request.data.get("database1")
            db2_name = request.data.get("database2")

            # Ensure input features are provided
            if not f1_name:
                return Response({"error": "Feature 1 is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not f2_name:  # Check for single value
                return Response({"error": "Feature 2 is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch Feature objects
            try:
                feature1 = Feature.objects.get(name=f1_name)
                # Get data_type for feature1
                f1_data_type = feature1.data_type  # This will be "num" or "cat"
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f1_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            try:
                feature2 = Feature.objects.get(name=f2_name)
                # Get data_type for feature2
                f2_data_type = feature2.data_type  # This will be "num" or "cat"
            except Feature.DoesNotExist:
                return Response({"error": f"Feature '{f2_name}' not found."}, status=status.HTTP_404_NOT_FOUND)

            f1_data = None
            f2_data = None

            # Query CellLine table using the retrieved Features
            if db1_name == "Nuclear":
                f1_data = Nuclear.objects.filter(feature=feature1)
            elif db1_name == "Molecular":
                f1_data = Molecular.objects.filter(feature=feature1)
            elif db1_name == "Drug Screen":
                f1_data = DrugScreen.objects.filter(feature=feature1)

            if db2_name == "Nuclear":
                f2_data = Nuclear.objects.filter(feature=feature2)
            elif db2_name == "Molecular":
                f2_data = Molecular.objects.filter(feature=feature2)
            elif db2_name == "Drug Screen":
                f2_data = DrugScreen.objects.filter(feature=feature2)

            if not f1_data or not f2_data:
                # print(f1_data.values_list())
                # print(f2_data)
                return Response({"error": "No cell line data found for the specified features."}, status=status.HTTP_404_NOT_FOUND)

            # Convert CellLine data into dataframes
            f1_queryset = f1_data.values_list()
            f2_queryset = f2_data.values_list()
            f1_df = pd.DataFrame(list(f1_queryset), columns=["Feature", *CELL_LINES])
            f2_df = pd.DataFrame(list(f2_queryset), columns=["Feature", *CELL_LINES])

            # Merge the two DataFrames by column
            merged_df = pd.concat([f1_df, f2_df], axis=0)

            # print("Merged DataFrame:")
            # print(merged_df.head(5))

            # Transpose the merged DataFrame
            transposed_df = merged_df.T.reset_index()
            transposed_df.columns = ["cell_lines"] + \
                [f"{f1_name}", f"{f2_name}"]  # Rename columns

            # Remove redundnant first row
            transposed_df = transposed_df.iloc[1:].reset_index(drop=True)

            # Drop columns with na values
            transposed_df = transposed_df.dropna(axis=0)

            # print("Transposed DataFrame:")
            # print(transposed_df.head(5))

            # Convert the transposed DataFrame to a JSON-compatible format
            transposed_json = transposed_df.to_dict(orient="records")
            print(transposed_json)

            # Include the data types in the response
            return Response({
                "scatter_data": transposed_json,
                "feature1_type": f1_data_type,
                "feature2_type": f2_data_type
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("Error:", traceback.format_exc())
            return Response({"Error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
