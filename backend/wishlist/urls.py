from django.urls import path
from .views import (
    WishlistView, RemoveFromWishlistView, UpdateWishlistNoteView,
    CheckWishlistView, ClearWishlistView
)

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist'),
    path('clear/', ClearWishlistView.as_view(), name='wishlist-clear-slash'),
    path('clear', ClearWishlistView.as_view(), name='wishlist-clear'),
    path('check/<uuid:property_id>/', CheckWishlistView.as_view(), name='wishlist-check-slash'),
    path('check/<uuid:property_id>', CheckWishlistView.as_view(), name='wishlist-check'),
    path('<uuid:property_id>/', RemoveFromWishlistView.as_view(), name='wishlist-remove-slash'),
    path('<uuid:property_id>', RemoveFromWishlistView.as_view(), name='wishlist-remove'),
    path('<uuid:property_id>/note/', UpdateWishlistNoteView.as_view(), name='wishlist-update-note-slash'),
    path('<uuid:property_id>/note', UpdateWishlistNoteView.as_view(), name='wishlist-update-note'),
]

