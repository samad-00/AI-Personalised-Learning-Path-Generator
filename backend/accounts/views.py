from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')

        if not otp_code:
            return Response({'error': 'OTP code is required for registration'}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj = OTPCode.objects.filter(email=email, purpose='register', code=otp_code, is_used=False).last()

        if not otp_obj or otp_obj.is_expired():
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid, proceed with registration
        response = super().create(request, *args, **kwargs)
        
        # Invalidate OTP after successful registration
        otp_obj.is_used = True
        otp_obj.save()

        return response

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        request.user.update_streak()
        request.user.save()
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=400)

        try:
            # Verify the Google token
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = idinfo.get('email')
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')

            if not email:
                return Response({'error': 'Email not found in token'}, status=400)

            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split(' ')[0] if name else '',
                    'last_name': ' '.join(name.split(' ')[1:]) if name else '',
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'created': created
            })

        except ValueError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


import random
from django.core.mail import send_mail, EmailMultiAlternatives
from email.mime.image import MIMEImage
from rest_framework.throttling import AnonRateThrottle
from .models import OTPCode

class OTPRequestThrottle(AnonRateThrottle):
    scope = 'otp_request'

class LoginThrottle(AnonRateThrottle):
    scope = 'login'

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginThrottle]

class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRequestThrottle]

    def post(self, request):
        email = request.data.get('email')
        purpose = request.data.get('purpose', 'login')

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        if purpose == 'reset':
            if not User.objects.filter(email=email).exists():
                return Response({'error': 'No user found with this email'}, status=404)
        elif purpose == 'register':
            if User.objects.filter(email=email).exists():
                return Response({'error': 'An account with this email already exists'}, status=400)

        code = str(random.randint(100000, 999999))
        
        OTPCode.objects.filter(email=email, purpose=purpose).update(is_used=True)
        OTPCode.objects.create(email=email, code=code, purpose=purpose)

        if purpose == 'register':
            subject = 'Welcome to LearnPath! Verify your email'
            greeting = 'Welcome to LearnPath! 🚀'
            body_text = 'We are absolutely thrilled to have you join our growing community of lifelong learners. LearnPath is designed to empower you by generating personalized, AI-driven roadmaps tailored specifically to your goals and pace. Whether you are looking to master a new skill, prepare for a career transition, or simply expand your horizons, you have come to the right place. To complete your registration and unlock your dashboard, please verify your email address using the code below.'
        elif purpose == 'reset':
            subject = 'LearnPath: Reset your password'
            greeting = 'Password Reset Request 🔐'
            body_text = 'We received a request to reset the password associated with your LearnPath account. We take your account security very seriously. If you initiated this request, please use the One-Time Password below to securely authenticate and set up a new password. If you did not make this request, it is safe to ignore and delete this email. Your account remains secure, and no changes will be made.'
        else:
            subject = 'LearnPath: Your Secure Login Code'
            greeting = 'Welcome Back! 👋'
            body_text = 'We noticed a request to access your LearnPath account. To ensure the highest level of security for your personal data and learning progress, we use a secure One-Time Password authentication system. This helps us verify your identity and keep your account completely safe from unauthorized access. Please use the code provided below to complete your login process and jump right back into your learning journey.'

        message = f'{greeting}\n\n{body_text}\n\nYour code is: {code}\n\nIt is valid for 15 minutes.'
        
        html_message = f"""
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #047857; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">LearnPath</h1>
            </div>
            
            <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">{greeting}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 30px;">
                {body_text}
            </p>
            
            <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <p style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">Your Verification Code</p>
                <div style="color: #047857; font-size: 42px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">{code}</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 0;">
                This code is valid for 15 minutes.<br>
                Please do not share this code with anyone.
            </p>
        </div>
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
                html_message=html_message
            )
            return Response({'message': 'OTP sent successfully'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)


class OTPLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=400)

        otp_obj = OTPCode.objects.filter(email=email, purpose='login', code=code, is_used=False).last()

        if not otp_obj or otp_obj.is_expired():
            return Response({'error': 'Invalid or expired OTP'}, status=400)

        otp_obj.is_used = True
        otp_obj.save()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
            }
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'created': created
        })


class OTPResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response({'error': 'Email, code, and new password are required'}, status=400)

        otp_obj = OTPCode.objects.filter(email=email, purpose='reset', code=code, is_used=False).last()

        if not otp_obj or otp_obj.is_expired():
            return Response({'error': 'Invalid or expired OTP'}, status=400)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()

            otp_obj.is_used = True
            otp_obj.save()

            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
class OTPResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response({'error': 'Email, code, and new password are required'}, status=400)

        otp_obj = OTPCode.objects.filter(email=email, purpose='reset', code=code, is_used=False).last()

        if not otp_obj or otp_obj.is_expired():
            return Response({'error': 'Invalid or expired OTP'}, status=400)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()

            otp_obj.is_used = True
            otp_obj.save()

            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)