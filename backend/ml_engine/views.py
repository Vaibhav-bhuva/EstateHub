import json
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema

from .serializers import PricePredictionInputSerializer, BuyerRequirementSerializer
from .predictor import predict_price, predict_buyer_budget, get_model_info
from core.mongo import get_collection


class PricePredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=PricePredictionInputSerializer,
        tags=['Machine Learning']
    )
    def post(self, request):
        serializer = PricePredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = predict_price(serializer.validated_data)

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Extract user data before passing to thread to avoid Django LazyObject thread-safety issues
        user_id = str(request.user.id)
        user_email = request.user.email
        user_role = request.user.role
        input_data = serializer.validated_data
        
        # Save prediction history to MongoDB (Background Thread)
        def save_history():
            try:
                collection = get_collection('prediction_history')
                collection.insert_one({
                    'user_id': user_id,
                    'user_email': user_email,
                    'role': user_role,
                    'input': input_data,
                    'result': result,
                    'created_at': timezone.now().isoformat()
                })
            except Exception:
                pass
                
        import threading
        threading.Thread(target=save_history, daemon=True).start()

        return Response(result)


class BuyerPredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=BuyerRequirementSerializer,
        tags=['Machine Learning']
    )
    def post(self, request):
        serializer = BuyerRequirementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = predict_buyer_budget(serializer.validated_data)

        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Extract user data before passing to thread to avoid Django LazyObject thread-safety issues
        user_id = str(request.user.id)
        user_email = request.user.email
        input_data = serializer.validated_data

        # Save to MongoDB (Background Thread)
        def save_buyer_history():
            try:
                collection = get_collection('prediction_history')
                collection.insert_one({
                    'user_id': user_id,
                    'user_email': user_email,
                    'role': 'buyer',
                    'type': 'buyer_requirement',
                    'input': input_data,
                    'result': result,
                    'created_at': timezone.now().isoformat()
                })
            except Exception:
                pass
                
        import threading
        threading.Thread(target=save_buyer_history, daemon=True).start()

        return Response(result)


class ModelInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        info = get_model_info()
        if not info:
            return Response({
                'status': 'not_trained',
                'message': 'Model not trained. Run: python train_model.py'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'status': 'ready', **info})


class PredictionHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            collection = get_collection('prediction_history')
            history = list(collection.find(
                {'user_id': str(request.user.id)},
                {'_id': 0}
            ).sort('created_at', -1).limit(20))
            return Response({'history': history})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminMLStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        try:
            collection = get_collection('prediction_history')
            total = collection.count_documents({})
            seller_preds = collection.count_documents({'role': 'seller'})
            buyer_preds = collection.count_documents({'role': 'buyer'})
            model_info = get_model_info()
            return Response({
                'total_predictions': total,
                'seller_predictions': seller_preds,
                'buyer_predictions': buyer_preds,
                'model_info': model_info
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
