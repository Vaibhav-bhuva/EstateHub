from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="EstateHub API",
        default_version='v1',
        description="Smart Property. Smart Prediction. - Complete Real Estate API",
        terms_of_service="https://estatehub.ai/terms/",
        contact=openapi.Contact(email="support@estatehub.ai"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/ml/', include('ml_engine.urls')),
    path('api/inquiries/', include('inquiries.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/cities/', include('cities.urls')),
    path('api/search/', include('cities.search_urls')),

    # Swagger
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
