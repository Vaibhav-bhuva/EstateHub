from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source='user.id', read_only=True)
    type = serializers.CharField(source='notification_type', read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'userId', 'title', 'message', 'type',
            'notification_type', 'reference_id', 'reference_type', 'link',
            'isRead', 'is_read', 'createdAt', 'created_at'
        ]
