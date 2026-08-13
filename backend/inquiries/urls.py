from django.urls import path
from .views import (
    InquiryCreateView, BuyerInquiriesView, SellerInquiriesView,
    AdminInquiriesView, UpdateInquiryStatusView, CancelInquiryView,
    InquiryDetailView, SellerUnreadInquiryCountView
)

urlpatterns = [
    path('', InquiryCreateView.as_view(), name='inquiry-create'),
    path('buyer', BuyerInquiriesView.as_view(), name='inquiry-buyer'),
    path('seller', SellerInquiriesView.as_view(), name='inquiry-seller'),
    path('seller/unread', SellerUnreadInquiryCountView.as_view(), name='inquiry-seller-unread'),
    path('admin', AdminInquiriesView.as_view(), name='inquiry-admin'),
    path('<uuid:pk>', InquiryDetailView.as_view(), name='inquiry-detail'),
    path('<uuid:pk>/status', UpdateInquiryStatusView.as_view(), name='inquiry-update-status'),
    path('<uuid:pk>/cancel', CancelInquiryView.as_view(), name='inquiry-cancel'),
]
