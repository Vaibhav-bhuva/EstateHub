import math
import calendar as cal_module

from django.db.models import Q, Sum, Count
from django.utils import timezone
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Property, PropertyImage
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer,
    PropertyCreateSerializer, PropertyUpdateSerializer,
    PropertyStatsSerializer
)
from .permissions import IsSeller, IsSellerOrAdmin, IsPropertyOwner, IsAdmin


class PropertyPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class PropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = PropertyPagination

    def get_queryset(self):
        qs = Property.objects.filter(status='available').prefetch_related('images').select_related('seller')
        params = self.request.query_params

        city = params.get('city')
        if city:
            qs = qs.filter(city__icontains=city)

        prop_type = params.get('property_type')
        if prop_type:
            qs = qs.filter(property_type=prop_type)

        min_price = params.get('min_price')
        max_price = params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        min_area = params.get('min_area')
        max_area = params.get('max_area')
        if min_area:
            qs = qs.filter(area_sqft__gte=min_area)
        if max_area:
            qs = qs.filter(area_sqft__lte=max_area)

        bedrooms = params.get('bedrooms')
        if bedrooms:
            qs = qs.filter(bedrooms=bedrooms)

        bathrooms = params.get('bathrooms')
        if bathrooms:
            qs = qs.filter(bathrooms=bathrooms)

        furnished = params.get('furnished')
        if furnished:
            qs = qs.filter(furnished=furnished)

        parking = params.get('parking')
        if parking:
            qs = qs.filter(parking__gte=parking)

        keyword = params.get('keyword')
        if keyword:
            qs = qs.filter(
                Q(title__icontains=keyword) |
                Q(description__icontains=keyword) |
                Q(city__icontains=keyword) |
                Q(address__icontains=keyword)
            )

        sort = params.get('sort', '-created_at')
        sort_map = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'price_asc': 'price',
            'price_desc': '-price',
            'most_viewed': '-views_count',
        }
        qs = qs.order_by(sort_map.get(sort, sort))
        return qs


class PropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PropertyDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Property.objects.prefetch_related('images').select_related('seller')
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Property.objects.filter(id=instance.id).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PropertyCreateView(generics.CreateAPIView):
    serializer_class = PropertyCreateSerializer
    permission_classes = [IsSeller]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prop = serializer.save(seller=request.user, published_at=timezone.now())

        # Handle uploaded images
        images = request.FILES.getlist('images')
        for idx, img in enumerate(images):
            PropertyImage.objects.create(
                property=prop,
                image=img,
                is_primary=(idx == 0),
                order=idx
            )

        # Trigger background ML model retraining with new data
        import threading
        from ml_scripts.retrainer import run_background_training
        threading.Thread(target=run_background_training, daemon=True).start()

        return Response(
            PropertyDetailSerializer(prop, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PropertyUpdateView(generics.UpdateAPIView):
    serializer_class = PropertyUpdateSerializer
    permission_classes = [IsSellerOrAdmin, IsPropertyOwner]
    queryset = Property.objects.all()
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        prop = serializer.save(updated_at=timezone.now())

        new_images = request.FILES.getlist('images')
        if new_images:
            for idx, img in enumerate(new_images):
                PropertyImage.objects.create(
                    property=prop,
                    image=img,
                    is_primary=False,
                    order=prop.images.count() + idx
                )

        return Response(PropertyDetailSerializer(prop, context={'request': request}).data)


class PropertyDeleteView(generics.DestroyAPIView):
    permission_classes = [IsSellerOrAdmin, IsPropertyOwner]
    queryset = Property.objects.all()
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Property deleted.'})


class SellerPropertiesView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [IsSeller]
    pagination_class = PropertyPagination

    def get_queryset(self):
        qs = Property.objects.filter(seller=self.request.user).prefetch_related('images')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')


class SellerDashboardStatsView(APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        props = Property.objects.filter(seller=request.user)
        stats = props.aggregate(
            total_views=Sum('views_count'),
            total_inquiries=Sum('inquiry_count'),
            total_saved=Sum('saved_count')
        )
        monthly_data = self._get_monthly_data(props)
        return Response({
            'total': props.count(),
            'available': props.filter(status='available').count(),
            'sold': props.filter(status='sold').count(),
            'rented': props.filter(status='rented').count(),
            'archived': props.filter(status='archived').count(),
            'total_views': stats['total_views'] or 0,
            'total_inquiries': stats['total_inquiries'] or 0,
            'total_saved': stats['total_saved'] or 0,
            'monthly_views': monthly_data,
            'property_type_dist': self._get_type_distribution(props),
        })

    def _get_monthly_data(self, props):
        from django.utils import timezone
        now = timezone.now()
        months = []
        views = []
        inquiries = []
        for i in range(5, -1, -1):
            month = (now.month - i - 1) % 12 + 1
            year = now.year if now.month - i > 0 else now.year - 1
            month_props = props.filter(created_at__year=year, created_at__month=month)
            months.append(cal_module.month_abbr[month])
            views.append(month_props.aggregate(v=Sum('views_count'))['v'] or 0)
            inquiries.append(month_props.aggregate(v=Sum('inquiry_count'))['v'] or 0)
        return {'labels': months, 'views': views, 'inquiries': inquiries}

    def _get_type_distribution(self, props):
        dist = {}
        for p in props.values('property_type').annotate(count=Count('id')):
            dist[p['property_type']] = p['count']
        return dist


class ArchivePropertyView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, id):
        try:
            prop = Property.objects.get(id=id, seller=request.user)
            prop.status = 'archived'
            prop.save()
            return Response({'message': 'Property archived.'})
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)


class RepublishPropertyView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, id):
        try:
            prop = Property.objects.get(id=id, seller=request.user)
            prop.status = 'available'
            prop.published_at = timezone.now()
            prop.save()
            return Response({'message': 'Property republished.'})
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)


class TrendingPropertiesView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Property.objects.filter(status='available').order_by('-views_count')[:10]


class RecommendedPropertiesView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Simple recommendation: same city as user's last viewed, similar price range
        qs = Property.objects.filter(status='available')
        city = self.request.query_params.get('city')
        budget = self.request.query_params.get('budget')
        prop_type = self.request.query_params.get('property_type')

        if city:
            qs = qs.filter(city__icontains=city)
        if budget:
            budget = float(budget)
            qs = qs.filter(price__lte=budget * 1.2, price__gte=budget * 0.8)
        if prop_type:
            qs = qs.filter(property_type=prop_type)

        return qs.order_by('-views_count')[:12]


class NearbyPropertiesView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = float(self.request.query_params.get('radius', 10))

        qs = Property.objects.filter(status='available')
        if lat and lng:
            lat, lng = float(lat), float(lng)
            lat_delta = radius / 111
            cos_lat = math.cos(math.radians(lat)) or 1
            lng_delta = radius / (111 * abs(cos_lat))
            qs = qs.filter(
                latitude__range=(lat - lat_delta, lat + lat_delta),
                longitude__range=(lng - lng_delta, lng + lng_delta)
            )
        return qs[:20]


class AdminPropertyListView(generics.ListAPIView):
    serializer_class = PropertyListSerializer
    permission_classes = [IsAdmin]
    pagination_class = PropertyPagination

    def get_queryset(self):
        qs = Property.objects.prefetch_related('images').select_related('seller')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')
