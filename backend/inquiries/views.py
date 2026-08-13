from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from .models import Inquiry
from .serializers import InquirySerializer, InquiryCreateSerializer, InquiryStatusUpdateSerializer
from properties.models import Property
from notifications.models import Notification


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'docs': data,
            'totalDocs': self.page.paginator.count,
            'limit': self.get_page_size(self.request),
            'totalPages': self.page.paginator.num_pages,
            'page': self.page.number,
            'hasPrevPage': self.page.has_previous(),
            'hasNextPage': self.page.has_next(),
        })


class InquiryCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InquiryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        property_id = data['propertyId']
        try:
            prop = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)

        buyer = request.user
        seller = prop.seller

        # Check existing active inquiry
        existing = Inquiry.objects.filter(
            property=prop,
            buyer=buyer,
            status__in=['pending', 'contacted']
        ).first()

        if existing:
            return Response({'error': 'You already have an active inquiry for this property.'}, status=status.HTTP_409_CONFLICT)

        reqs = data.get('requirements', {})
        budget = reqs.get('budget')
        visit_date = reqs.get('visitDate')

        inquiry = Inquiry.objects.create(
            property=prop,
            seller=seller,
            buyer=buyer,
            buyer_email=buyer.email,
            buyer_name=buyer.get_full_name(),
            buyer_phone=data.get('buyerPhone') or buyer.phone or '',
            message=data['message'],
            budget=budget,
            visit_date=visit_date,
        )

        # Increment property inquiry count
        Property.objects.filter(id=prop.id).update(inquiry_count=prop.inquiry_count + 1)

        # Notification for seller
        Notification.objects.create(
            user=seller,
            title='New Property Inquiry',
            message=f'{inquiry.buyer_name} sent an inquiry for "{prop.title}"',
            notification_type='inquiry',
            reference_id=str(inquiry.id),
            reference_type='Inquiry',
            link=f'/seller/inquiries'
        )

        return Response({
            'message': 'Inquiry sent successfully.',
            'inquiry': InquirySerializer(inquiry).data
        }, status=status.HTTP_201_CREATED)


class BuyerInquiriesView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Inquiry.objects.filter(buyer=self.request.user).select_related('property', 'seller')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')


class SellerInquiriesView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Inquiry.objects.filter(seller=self.request.user).select_related('property', 'buyer')
        status_filter = self.request.query_params.get('status')
        prop_id = self.request.query_params.get('propertyId')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if prop_id:
            qs = qs.filter(property_id=prop_id)
        return qs.order_by('-created_at')


class AdminInquiriesView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Inquiry.objects.none()
        qs = Inquiry.objects.all().select_related('property', 'seller', 'buyer')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')


class UpdateInquiryStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            inquiry = Inquiry.objects.get(id=pk, seller=request.user)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = InquiryStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        inquiry.status = serializer.validated_data['status']
        if 'sellerNote' in serializer.validated_data:
            inquiry.seller_note = serializer.validated_data['sellerNote']
        inquiry.is_read = True
        inquiry.save()

        # Notify buyer
        Notification.objects.create(
            user=inquiry.buyer,
            title='Inquiry Status Updated',
            message=f'Your inquiry for "{inquiry.property.title}" has been updated to {inquiry.status}.',
            notification_type='inquiry',
            reference_id=str(inquiry.id),
            reference_type='Inquiry',
            link=f'/buyer/inquiries'
        )

        return Response({
            'message': 'Inquiry updated.',
            'inquiry': InquirySerializer(inquiry).data
        })


class CancelInquiryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            inquiry = Inquiry.objects.get(id=pk, buyer=request.user)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

        if inquiry.status in ['closed', 'rejected']:
            return Response({'error': 'Cannot cancel a closed/rejected inquiry.'}, status=status.HTTP_400_BAD_REQUEST)

        inquiry.status = 'closed'
        inquiry.save()

        return Response({'message': 'Inquiry cancelled.'})


class InquiryDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            inquiry = Inquiry.objects.select_related('property', 'seller', 'buyer').get(id=pk)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if inquiry.buyer != user and inquiry.seller != user and user.role != 'admin':
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if inquiry.seller == user and not inquiry.is_read:
            inquiry.is_read = True
            inquiry.save()

        return Response(InquirySerializer(inquiry).data)


class SellerUnreadInquiryCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Inquiry.objects.filter(seller=request.user, is_read=False).count()
        return Response({'unread': count})
