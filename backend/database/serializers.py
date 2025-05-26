import math
from rest_framework import serializers

from .models import Feature, Nuclear, Molecular, DrugScreen, Feature_TCGA, Nuclear_TCGA, Molecular_TCGA, Clinical_TCGA, FracLac_TCGA
from .utils.constants import CELL_LINES, PATIENTS


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name', 'data_type', 'category', 'sub_category']


class FeatureTCGASerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature_TCGA
        fields = ['name', 'data_type', 'category', 'sub_category']


class BaseSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        for field in rep:
            # Check if the value is NaN and replace it with None or a default value
            if isinstance(rep[field], float) and (math.isnan(rep[field]) or math.isinf(rep[field])):
                rep[field] = None
        return rep
    

def create_serializer(model_name, feature_serializer, field_list):
    class DynamicSerializer(BaseSerializer):
        feature = feature_serializer()

        class Meta:
            model = model_name
            fields = ['feature', *field_list]

    return DynamicSerializer


NuclearSerializer = create_serializer(Nuclear, FeatureSerializer, CELL_LINES)
MolecularSerializer = create_serializer(Molecular, FeatureSerializer, CELL_LINES)
DrugScreenSerializer = create_serializer(DrugScreen, FeatureSerializer, CELL_LINES)


NuclearTCGASerializer = create_serializer(Nuclear_TCGA, FeatureTCGASerializer, PATIENTS)
MolecularTCGASerializer = create_serializer(Molecular_TCGA, FeatureTCGASerializer, PATIENTS)
FracLacTCGASerializer = create_serializer(FracLac_TCGA, FeatureTCGASerializer, PATIENTS)


class ClinicalTCGASerializer(serializers.ModelSerializer):
    feature = FeatureTCGASerializer()

    class Meta:
        model = Clinical_TCGA
        fields = ['feature', *[patient for patient in PATIENTS]]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        data_type = rep['feature']['data_type']

        for patient in PATIENTS:
            val = rep.get(patient)
            if val is not None:
                if data_type == 'num':
                    try:
                        rep[patient] = float(val)
                    except (ValueError, TypeError):
                        rep[patient] = None
                elif data_type == 'cat':
                    rep[patient] = str(val)
        return rep
