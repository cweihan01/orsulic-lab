from rest_framework import serializers
import math

from .models import Feature, Nuclear, Mole_GlobalChromatin, CELL_LINES


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name', 'data_type', 'category', 'sub_category']

class Mole_GlobalSerializer(serializers.ModelSerializer):
    feature = FeatureSerializer()

    class Meta:
        model = Mole_GlobalChromatin
        fields = ['feature', *[cellline for cellline in CELL_LINES]]

    # Custom serialization to handle NaN values
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        for field in rep:
            # Check if the value is NaN and replace it with None or a default value
            if isinstance(rep[field], float) and (math.isnan(rep[field]) or math.isinf(rep[field])):
                rep[field] = None
        return rep


class NuclearSerializer(serializers.ModelSerializer):
    feature = FeatureSerializer()

    class Meta:
        model = Nuclear
        fields = ['feature', *[cellline for cellline in CELL_LINES]]

    # Custom serialization to handle NaN values
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        for field in rep:
            # Check if the value is NaN and replace it with None or a default value
            if isinstance(rep[field], float) and (math.isnan(rep[field]) or math.isinf(rep[field])):
                rep[field] = None
        return rep
