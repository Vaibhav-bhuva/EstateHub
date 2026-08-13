from django.contrib import admin
from .models import Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'property_type', 'status', 'price', 'city', 'seller', 'views_count', 'created_at']
    list_filter = ['property_type', 'status', 'city', 'furnished']
    search_fields = ['title', 'description', 'city', 'address']
    ordering = ['-created_at']
    inlines = [PropertyImageInline]
    readonly_fields = ['views_count', 'saved_count', 'inquiry_count', 'created_at', 'updated_at']


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary']
