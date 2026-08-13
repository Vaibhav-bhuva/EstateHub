from django.urls import path
from . import views

urlpatterns = [
    path('predict/price/', views.PricePredictionView.as_view(), name='predict_price'),
    path('predict/buyer/', views.BuyerPredictionView.as_view(), name='predict_buyer'),
    path('model/info/', views.ModelInfoView.as_view(), name='model_info'),
    path('history/', views.PredictionHistoryView.as_view(), name='prediction_history'),
    path('admin/stats/', views.AdminMLStatsView.as_view(), name='ml_admin_stats'),
]
