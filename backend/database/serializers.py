from rest_framework import serializers
import math

from .models import Feature, CellLine, CELL_LINES

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name']

class CellLineSerializer(serializers.ModelSerializer):
    feature = FeatureSerializer()

    class Meta:
        model = CellLine
        fields = ['feature', *[cellline for cellline in CELL_LINES]]

    def to_representation(self, instance):
        # Custom serialization to handle NaN values
        representation = super().to_representation(instance)
        
        for field in representation:
            # Check if the value is NaN and replace it with None or a default value
            if isinstance(representation[field], float) and (math.isnan(representation[field]) or math.isinf(representation[field])):
                representation[field] = None
        return representation
