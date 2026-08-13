from django.urls import path
from .views import (
    CityListView, SeedCitiesView, SearchCitiesView,
    SearchSuggestionsView, TopCitiesView, WishlistTrendsView
)

urlpatterns = [
    path('', CityListView.as_view(), name='city-list'),
    path('seed', SeedCitiesView.as_view(), name='city-seed'),
]
