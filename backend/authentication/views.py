import random
import string
import uuid
import requests
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from django.contrib.auth import update_session_auth_hash
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from drf_yasg.utils import swagger_auto_schema

from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, VerifyOTPSerializer
)


from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenRefreshView


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email
    refresh['full_name'] = user.get_full_name()
    access = refresh.access_token
    access['role'] = user.role
    access['email'] = user.email
    access['full_name'] = user.get_full_name()
    return {
        'refresh': str(refresh),
        'access': str(access),
    }


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = RefreshToken(attrs['refresh'])
        user_id = refresh.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                new_access = refresh.access_token
                new_access['role'] = user.role
                new_access['email'] = user.email
                new_access['full_name'] = user.get_full_name()
                data['access'] = str(new_access)
            except User.DoesNotExist:
                pass
        return data


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer



class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(request_body=RegisterSerializer, tags=['Authentication'])
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Auto-verify new accounts so users can log in without SMTP/OTP.
            user.is_verified = True
            user.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Registration successful.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(request_body=LoginSerializer, tags=['Authentication'])
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'tokens': tokens,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Profile updated.', 'user': serializer.data})


class UploadProfilePhotoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if 'photo' not in request.FILES:
            return Response({'error': 'No photo provided.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.profile_photo = request.FILES['photo']
        user.save()
        return Response({
            'message': 'Photo uploaded.',
            'user': UserProfileSerializer(user, context={'request': request}).data,
        })


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp = generate_otp()
                user.otp_code = otp
                user.otp_created_at = timezone.now()
                user.save()
                try:
                    send_mail(
                        subject='EstateHub - Password Reset OTP',
                        message=f'Your password reset OTP is: {otp}\nValid for 10 minutes.',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as e:
                    print(f"⚠️ Email dispatch error (Password Reset): {e}")
                    # Still return success in console mode, but print error
            except User.DoesNotExist:
                pass
            return Response({'message': 'If the email exists, an OTP has been sent.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            try:
                user = User.objects.get(email=email)
                if user.otp_code != otp:
                    return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
                if not user.otp_created_at:
                    return Response({'error': 'OTP not issued.'}, status=status.HTTP_400_BAD_REQUEST)
                if timezone.now() - user.otp_created_at > timedelta(minutes=10):
                    return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
                user.set_password(serializer.validated_data['new_password'])
                user.otp_code = None
                user.otp_created_at = None
                user.save()
                return Response({'message': 'Password reset successfully.'})
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            try:
                user = User.objects.get(email=email)
                if user.otp_code != otp:
                    return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
                if not user.otp_created_at:
                    return Response({'error': 'OTP not issued.'}, status=status.HTTP_400_BAD_REQUEST)
                if timezone.now() - user.otp_created_at > timedelta(minutes=10):
                    return Response({'error': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
                user.is_verified = True
                user.otp_code = None
                user.otp_created_at = None
                user.save()
                return Response({'message': 'Email verified successfully.'})
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            otp = generate_otp()
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()
            try:
                send_mail(
                    subject='EstateHub - New OTP',
                    message=f'Your new OTP is: {otp}\nValid for 10 minutes.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"⚠️ Email dispatch error (Resend OTP): {e}")
            return Response({'message': 'OTP sent successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id=None):
        if request.user.role != 'admin':
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                serializer = UserProfileSerializer(user, context={'request': request})
                return Response({'user': serializer.data})
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        users = User.objects.all().order_by('-created_at')
        serializer = UserProfileSerializer(users, many=True, context={'request': request})
        return Response({'users': serializer.data, 'total': users.count()})

    def delete(self, request, user_id=None):
        if request.user.role != 'admin':
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        if not user_id:
            return Response({'error': 'User ID required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            if user == request.user:
                return Response({'error': 'You cannot delete your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({'message': 'User deleted.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        role = request.data.get('role', 'buyer')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use access token to fetch user info
            user_res = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'}
            )
            if not user_res.ok:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
                
            idinfo = user_res.json()
            email = idinfo.get('email')
            if not email:
                return Response({'error': 'No email found in Google account'}, status=status.HTTP_400_BAD_REQUEST)
                
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': role,
                'is_verified': True
            })

            if created:
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': UserProfileSerializer(user).data
            })
        except Exception as e:
            return Response({'error': f'Failed to process Google login: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class GitHubLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        role = request.data.get('role', 'buyer')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = settings.GITHUB_CLIENT_ID if hasattr(settings, 'GITHUB_CLIENT_ID') else 'YOUR_GITHUB_CLIENT_ID'
        client_secret = settings.GITHUB_CLIENT_SECRET if hasattr(settings, 'GITHUB_CLIENT_SECRET') else 'YOUR_GITHUB_CLIENT_SECRET'

        token_res = requests.post(
            'https://github.com/login/oauth/access_token',
            data={'client_id': client_id, 'client_secret': client_secret, 'code': code},
            headers={'Accept': 'application/json'}
        )
        token_json = token_res.json()
        access_token = token_json.get('access_token')
        if not access_token:
            return Response({'error': 'Failed to get access token from GitHub'}, status=status.HTTP_400_BAD_REQUEST)

        user_res = requests.get('https://api.github.com/user', headers={'Authorization': f'Bearer {access_token}'})
        user_data = user_res.json()
        
        email = user_data.get('email')
        if not email:
            email_res = requests.get('https://api.github.com/user/emails', headers={'Authorization': f'Bearer {access_token}'})
            emails = email_res.json()
            primary = next((e for e in emails if e.get('primary')), None)
            if primary:
                email = primary['email']
        
        if not email:
            return Response({'error': 'No email found in GitHub account'}, status=status.HTTP_400_BAD_REQUEST)

        name = user_data.get('name') or user_data.get('login') or 'GitHub User'
        parts = name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        user, created = User.objects.get_or_create(email=email, defaults={
            'first_name': first_name,
            'last_name': last_name,
            'role': role,
            'is_verified': True
        })

        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': UserProfileSerializer(user).data
        })

