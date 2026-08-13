from django.urls import path
from .views import (
    NotificationListView, UnreadNotificationCountView,
    MarkNotificationReadView, MarkAllNotificationsReadView,
    DeleteNotificationView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread', UnreadNotificationCountView.as_view(), name='notification-unread'),
    path('read-all', MarkAllNotificationsReadView.as_view(), name='notification-read-all'),
    path('<uuid:pk>/read', MarkNotificationReadView.as_view(), name='notification-read'),
    path('<uuid:pk>', DeleteNotificationView.as_view(), name='notification-delete'),
]
