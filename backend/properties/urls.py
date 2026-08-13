from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.PropertyListView.as_view(), name='property_list'),
    path('<uuid:id>/', views.PropertyDetailView.as_view(), name='property_detail'),
    path('trending/', views.TrendingPropertiesView.as_view(), name='trending'),
    path('nearby/', views.NearbyPropertiesView.as_view(), name='nearby'),

    # Authenticated buyer
    path('recommendations/', views.RecommendedPropertiesView.as_view(), name='recommendations'),

    # Seller
    path('seller/properties/', views.SellerPropertiesView.as_view(), name='seller_properties'),
    path('seller/dashboard/', views.SellerDashboardStatsView.as_view(), name='seller_dashboard'),
    path('create/', views.PropertyCreateView.as_view(), name='property_create'),
    path('<uuid:id>/update/', views.PropertyUpdateView.as_view(), name='property_update'),
    path('<uuid:id>/delete/', views.PropertyDeleteView.as_view(), name='property_delete'),
    path('<uuid:id>/archive/', views.ArchivePropertyView.as_view(), name='property_archive'),
    path('<uuid:id>/republish/', views.RepublishPropertyView.as_view(), name='property_republish'),

    # Admin
    path('admin/all/', views.AdminPropertyListView.as_view(), name='admin_properties'),
]
