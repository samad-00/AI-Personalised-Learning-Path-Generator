from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, ProfileView, GoogleAuthView, 
    OTPRequestView, OTPLoginView, OTPResetPasswordView,
    CustomTokenObtainPairView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/login/', OTPLoginView.as_view(), name='otp-login'),
    path('otp/reset-password/', OTPResetPasswordView.as_view(), name='otp-reset-password'),
]