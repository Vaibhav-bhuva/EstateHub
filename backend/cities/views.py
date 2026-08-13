from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q

from .models import City
from .serializers import CitySerializer
from properties.models import Property
from inquiries.models import Inquiry
from wishlist.models import WishlistItem
from properties.serializers import PropertyListSerializer


class CityListView(generics.ListAPIView):
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return City.objects.filter(is_active=True).order_by('-property_count')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response({'cities': serializer.data, 'total': qs.count()})


class SeedCitiesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        default_cities = [
            {'name': 'Mumbai', 'state': 'Maharashtra', 'latitude': 19.0760, 'longitude': 72.8777, 'popular_areas': ['Bandra', 'Andheri', 'Powai', 'Thane']},
            {'name': 'Delhi', 'state': 'Delhi', 'latitude': 28.6139, 'longitude': 77.2090, 'popular_areas': ['Noida', 'Gurgaon', 'Dwarka', 'Rohini']},
            {'name': 'Bangalore', 'state': 'Karnataka', 'latitude': 12.9716, 'longitude': 77.5946, 'popular_areas': ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout']},
            {'name': 'Hyderabad', 'state': 'Telangana', 'latitude': 17.3850, 'longitude': 78.4867, 'popular_areas': ['Hitech City', 'Gachibowli', 'Banjara Hills']},
            {'name': 'Chennai', 'state': 'Tamil Nadu', 'latitude': 13.0827, 'longitude': 80.2707, 'popular_areas': ['Anna Nagar', 'Adyar', 'Velachery', 'OMR']},
            {'name': 'Pune', 'state': 'Maharashtra', 'latitude': 18.5204, 'longitude': 73.8567, 'popular_areas': ['Hinjewadi', 'Kothrud', 'Viman Nagar', 'Baner']},
            {'name': 'Kolkata', 'state': 'West Bengal', 'latitude': 22.5726, 'longitude': 88.3639, 'popular_areas': ['Salt Lake', 'New Town', 'Park Street']},
            {'name': 'Ahmedabad', 'state': 'Gujarat', 'latitude': 23.0225, 'longitude': 72.5714, 'popular_areas': ['Satellite', 'Vastrapur', 'Prahlad Nagar']},
            {'name': 'Jaipur', 'state': 'Rajasthan', 'latitude': 26.9124, 'longitude': 75.7873, 'popular_areas': ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme']},
            {'name': 'Surat', 'state': 'Gujarat', 'latitude': 21.1702, 'longitude': 72.8311, 'popular_areas': ['Vesu', 'Adajan', 'Piplod']},
        ]

        created = 0
        for c in default_cities:
            city_obj, is_new = City.objects.get_or_create(
                name=c['name'],
                defaults=c
            )
            if is_new:
                created += 1

        return Response({'message': f'Seeded {created} cities.'})


class SearchCitiesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 10))
        cities = City.objects.filter(is_active=True, name__icontains=q)[:limit]
        serializer = CitySerializer(cities, many=True)
        return Response({'cities': serializer.data, 'total': cities.count()})


class SearchSuggestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '')
        if len(q) < 2:
            return Response({'suggestions': []})

        cities = City.objects.filter(is_active=True, name__icontains=q)[:5]
        suggestions = [{
            'type': 'city',
            'label': f'{c.name}, {c.state}',
            'value': c.name,
        } for c in cities]

        return Response({'suggestions': suggestions})


class TopCitiesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top = Inquiry.objects.values('property__city').annotate(inquiries=Count('id')).order_by('-inquiries')[:10]
        stats = [{'city': item['property__city'], 'inquiries': item['inquiries']} for item in top if item['property__city']]
        return Response({'stats': stats})


class WishlistTrendsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top_saved = Property.objects.filter(status='available').order_by('-saved_count')[:10]
        serializer = PropertyListSerializer(top_saved, many=True, context={'request': request})
        return Response({'trends': serializer.data})
