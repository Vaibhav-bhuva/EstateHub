from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('google/', views.GoogleLoginView.as_view(), name='google_login'),
    path('github/', views.GitHubLoginView.as_view(), name='github_login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/photo/', views.UploadProfilePhotoView.as_view(), name='upload_photo'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/', views.ResendOTPView.as_view(), name='resend_otp'),
    path('admin/users/', views.AdminUsersView.as_view(), name='admin_users'),
    path('admin/users/<uuid:user_id>/', views.AdminUsersView.as_view(), name='admin_user_detail'),
]

