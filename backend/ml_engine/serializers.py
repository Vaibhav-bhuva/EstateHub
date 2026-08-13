from rest_framework import serializers


class PricePredictionInputSerializer(serializers.Serializer):
    city = serializers.CharField()
    property_type = serializers.ChoiceField(choices=[
        'Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'
    ])
    area_sqft = serializers.FloatField(min_value=50)
    bedrooms = serializers.IntegerField(min_value=0, max_value=20)
    bathrooms = serializers.IntegerField(min_value=0, max_value=20)
    age_years = serializers.IntegerField(min_value=0, max_value=100, default=0)
    floor = serializers.IntegerField(min_value=0, max_value=100, default=0)
    parking = serializers.IntegerField(min_value=0, max_value=10, default=0)
    furnished = serializers.ChoiceField(
        choices=['Furnished', 'Semi-Furnished', 'Unfurnished'],
        default='Unfurnished'
    )
    facing = serializers.ChoiceField(
        choices=['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
        default='North'
    )
    road_width = serializers.IntegerField(min_value=5, max_value=200, default=20)
    location_score = serializers.FloatField(min_value=1.0, max_value=10.0, default=5.0)
    nearby_schools = serializers.IntegerField(min_value=0, default=0)
    nearby_hospital = serializers.IntegerField(min_value=0, default=0)
    nearby_metro = serializers.IntegerField(min_value=0, default=0)
    seller_price = serializers.FloatField(required=False, allow_null=True)


class BuyerRequirementSerializer(serializers.Serializer):
    budget = serializers.FloatField(min_value=100000)
    city = serializers.CharField()
    property_type = serializers.ChoiceField(choices=[
        'Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'
    ], default='Apartment')
    bedrooms = serializers.IntegerField(min_value=1, max_value=10, default=2)
    bathrooms = serializers.IntegerField(min_value=1, max_value=10, default=2)
    area_sqft = serializers.FloatField(required=False, allow_null=True)
    parking = serializers.IntegerField(min_value=0, max_value=5, default=1)
    amenities = serializers.ListField(child=serializers.CharField(), required=False)
