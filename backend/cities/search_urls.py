from django.urls import path
from .views import (
    SearchCitiesView, SearchSuggestionsView,
    TopCitiesView, WishlistTrendsView
)

urlpatterns = [
    path('cities', SearchCitiesView.as_view(), name='search-cities'),
    path('suggestions', SearchSuggestionsView.as_view(), name='search-suggestions'),
    path('top-cities', TopCitiesView.as_view(), name='search-top-cities'),
    path('wishlist-trends', WishlistTrendsView.as_view(), name='search-wishlist-trends'),
]
