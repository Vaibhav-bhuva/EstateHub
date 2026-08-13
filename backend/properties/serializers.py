from rest_framework import serializers
from .models import Property, PropertyImage
from authentication.serializers import UserProfileSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'is_primary', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'property_type', 'status', 'price', 'ai_estimated_price',
            'area_sqft', 'bedrooms', 'bathrooms', 'city', 'address',
            'latitude', 'longitude', 'furnished', 'parking',
            'views_count', 'saved_count', 'inquiry_count',
            'primary_image', 'seller_name', 'created_at'
        ]

    def get_primary_image(self, obj):
        request = self.context.get('request')
        all_imgs = list(obj.images.all())
        img = next((i for i in all_imgs if i.is_primary), all_imgs[0] if all_imgs else None)
        if img and request:
            return request.build_absolute_uri(img.image.url)
        elif img:
            return img.image.url
        return None

    def get_seller_name(self, obj):
        return obj.seller.get_full_name()


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    seller = UserProfileSerializer(read_only=True)

    class Meta:
        model = Property
        fields = '__all__'


class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        exclude = ['seller', 'views_count', 'saved_count', 'inquiry_count', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be positive.')
        return value

    def validate_area_sqft(self, value):
        if value <= 0:
            raise serializers.ValidationError('Area must be positive.')
        return value


class PropertyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        exclude = ['seller', 'views_count', 'saved_count', 'inquiry_count', 'created_at', 'updated_at']
        extra_kwargs = {field: {'required': False} for field in [
            'title', 'description', 'property_type', 'price', 'area_sqft',
            'bedrooms', 'bathrooms', 'city', 'address'
        ]}


class PropertyStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    available = serializers.IntegerField()
    sold = serializers.IntegerField()
    rented = serializers.IntegerField()
    archived = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_inquiries = serializers.IntegerField()
    total_saved = serializers.IntegerField()
