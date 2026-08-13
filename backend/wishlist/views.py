from django.db import models
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import WishlistItem
from .serializers import WishlistItemSerializer
from properties.models import Property


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related('property').prefetch_related('property__images')
        serializer = WishlistItemSerializer(items, many=True, context={'request': request})
        return Response({
            'items': serializer.data,
            'total': items.count()
        })

    def post(self, request):
        property_id = request.data.get('propertyId') or request.data.get('property_id') or request.data.get('property')
        note = request.data.get('note', '')

        if not property_id:
            return Response({'error': 'propertyId is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prop = Property.objects.get(id=property_id)
        except (Property.DoesNotExist, ValueError):
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            property=prop,
            defaults={'note': note}
        )

        if not created:
            return Response({'error': 'Property already in wishlist.', 'already_in_wishlist': True}, status=status.HTTP_200_OK)

        # Update saved_count on property
        Property.objects.filter(id=prop.id).update(saved_count=prop.saved_count + 1)

        total = WishlistItem.objects.filter(user=request.user).count()
        return Response({'message': 'Added to wishlist.', 'total': total}, status=status.HTTP_201_CREATED)


class RemoveFromWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, property_id):
        item = WishlistItem.objects.filter(user=request.user).filter(
            models.Q(property_id=property_id) | models.Q(id=property_id)
        ).first()

        if not item:
            return Response({'error': 'Property not found in wishlist.'}, status=status.HTTP_404_NOT_FOUND)

        actual_property_id = item.property_id
        item.delete()

        # Decrement saved_count
        prop = Property.objects.filter(id=actual_property_id).first()
        if prop and prop.saved_count > 0:
            Property.objects.filter(id=actual_property_id).update(saved_count=prop.saved_count - 1)

        total = WishlistItem.objects.filter(user=request.user).count()
        return Response({'message': 'Removed from wishlist.', 'total': total})


class UpdateWishlistNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, property_id):
        note = request.data.get('note', '')
        item = WishlistItem.objects.filter(user=request.user).filter(
            models.Q(property_id=property_id) | models.Q(id=property_id)
        ).first()

        if not item:
            return Response({'error': 'Property not found in wishlist.'}, status=status.HTTP_404_NOT_FOUND)

        item.note = note
        item.save()
        return Response({
            'message': 'Note updated.',
            'item': WishlistItemSerializer(item, context={'request': request}).data
        })


class CheckWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, property_id):
        exists = WishlistItem.objects.filter(user=request.user).filter(
            models.Q(property_id=property_id) | models.Q(id=property_id)
        ).exists()
        return Response({'inWishlist': exists})


class ClearWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        items = list(WishlistItem.objects.filter(user=request.user))
        for item in items:
            prop = item.property
            if prop and prop.saved_count > 0:
                Property.objects.filter(id=prop.id).update(saved_count=prop.saved_count - 1)
        WishlistItem.objects.filter(user=request.user).delete()
        return Response({'message': 'Wishlist cleared.', 'total': 0})
