from rest_framework import serializers
from .models import WishlistItem
from properties.serializers import PropertyListSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    propertyId = serializers.UUIDField(source='property.id', read_only=True)
    propertyTitle = serializers.CharField(source='property.title', read_only=True)
    propertyType = serializers.CharField(source='property.property_type', read_only=True)
    propertyCity = serializers.CharField(source='property.city', read_only=True)
    price = serializers.DecimalField(source='property.price', max_digits=15, decimal_places=2, read_only=True)
    area = serializers.IntegerField(source='property.area_sqft', read_only=True)
    bedrooms = serializers.IntegerField(source='property.bedrooms', read_only=True)
    primaryImage = serializers.SerializerMethodField(method_name='get_primary_image')
    primary_image = serializers.SerializerMethodField(method_name='get_primary_image')
    addedAt = serializers.DateTimeField(source='created_at', read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'property', 'propertyId', 'propertyTitle', 'propertyType',
            'propertyCity', 'price', 'area', 'bedrooms', 'primaryImage',
            'primary_image', 'note', 'addedAt', 'created_at', 'property_details'
        ]

    def get_primary_image(self, obj):
        request = self.context.get('request')
        if not obj.property:
            return None
        all_imgs = list(obj.property.images.all())
        img = next((i for i in all_imgs if i.is_primary), all_imgs[0] if all_imgs else None)
        if img and request:
            return request.build_absolute_uri(img.image.url)
        elif img:
            return img.image.url
        return None

    def get_primaryImage(self, obj):
        return self.get_primary_image(obj)
