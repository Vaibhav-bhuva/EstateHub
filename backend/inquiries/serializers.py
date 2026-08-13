from rest_framework import serializers
from .models import Inquiry
from properties.serializers import PropertyListSerializer


class InquirySerializer(serializers.ModelSerializer):
    property_details = PropertyListSerializer(source='property', read_only=True)
    propertyId = serializers.UUIDField(source='property.id', read_only=True)
    propertyTitle = serializers.CharField(source='property.title', read_only=True)
    propertyCity = serializers.CharField(source='property.city', read_only=True)
    sellerId = serializers.UUIDField(source='seller.id', read_only=True)
    sellerEmail = serializers.EmailField(source='seller.email', read_only=True)
    sellerName = serializers.CharField(source='seller.get_full_name', read_only=True)
    buyerId = serializers.UUIDField(source='buyer.id', read_only=True)
    buyerEmail = serializers.EmailField(source='buyer_email', read_only=True)
    buyerName = serializers.CharField(source='buyer_name', read_only=True)
    buyerPhone = serializers.CharField(source='buyer_phone', read_only=True)
    sellerNote = serializers.CharField(source='seller_note', read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Inquiry
        fields = [
            'id', 'property', 'property_details', 'propertyId', 'propertyTitle', 'propertyCity',
            'seller', 'sellerId', 'sellerEmail', 'sellerName',
            'buyer', 'buyerId', 'buyerEmail', 'buyerName', 'buyerPhone',
            'message', 'budget', 'visit_date', 'status', 'sellerNote', 'isRead',
            'created_at', 'createdAt', 'updated_at'
        ]


class InquiryCreateSerializer(serializers.Serializer):
    propertyId = serializers.UUIDField()
    sellerId = serializers.UUIDField(required=False)
    message = serializers.CharField(max_length=1000)
    buyerPhone = serializers.CharField(required=False, allow_blank=True)
    requirements = serializers.DictField(required=False)


class InquiryStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['pending', 'contacted', 'closed', 'rejected'])
    sellerNote = serializers.CharField(required=False, allow_blank=True, max_length=500)
