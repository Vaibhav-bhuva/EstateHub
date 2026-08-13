from rest_framework import serializers
from .models import City


class CitySerializer(serializers.ModelSerializer):
    popularAreas = serializers.ListField(source='popular_areas', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    propertyCount = serializers.IntegerField(source='property_count', read_only=True)

    class Meta:
        model = City
        fields = [
            'id', 'name', 'state', 'latitude', 'longitude',
            'popularAreas', 'popular_areas', 'isActive', 'is_active',
            'propertyCount', 'property_count'
        ]
