from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, EmailVerificationToken, PasswordResetToken
from .serializers import (
    RegisterSerializer, UserSerializer, AdminUserSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


# ── Register ──────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=400)
    user = s.save()

    # Create verification token and send email
    token_obj = EmailVerificationToken.objects.create(user=user)
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token_obj.token}"
    send_mail(
        subject='Verify your CELPIP Trainer account',
        message=f"""Hi {user.full_name},

Welcome to CELPIP Trainer! Please verify your email address by clicking the link below:

{verify_url}

This link expires in 24 hours.

Good luck with your CELPIP preparation!
The CELPIP Trainer Team""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return Response({
        'message': 'Account created. Please check your email to verify your account.',
        'email': user.email,
    }, status=201)


# ── Verify Email ──────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required.'}, status=400)
    try:
        token_obj = EmailVerificationToken.objects.get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response({'error': 'Invalid verification token.'}, status=400)

    if not token_obj.is_valid():
        token_obj.delete()
        return Response({'error': 'This verification link has expired. Please register again.'}, status=400)

    user = token_obj.user
    user.is_verified = True
    user.save()
    token_obj.delete()

    return Response({'message': 'Email verified successfully. You can now log in.'})


# ── Resend Verification ───────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification(request):
    email = request.data.get('email')
    try:
        user = CustomUser.objects.get(email=email, is_verified=False)
    except CustomUser.DoesNotExist:
        return Response({'message': 'If that email exists and is unverified, we sent a new link.'})

    EmailVerificationToken.objects.filter(user=user).delete()
    token_obj = EmailVerificationToken.objects.create(user=user)
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token_obj.token}"
    send_mail(
        subject='Verify your CELPIP Trainer account',
        message=f"Hi {user.full_name},\n\nYour new verification link:\n\n{verify_url}\n\nThis link expires in 24 hours.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return Response({'message': 'If that email exists and is unverified, we sent a new link.'})


# ── Login ─────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    email = request.data.get('email', '').lower().strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=400)

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'error': 'Invalid email or password.'}, status=401)
    if not user.is_verified:
        return Response({'error': 'Please verify your email before logging in.', 'unverified': True}, status=403)
    if not user.is_active:
        return Response({'error': 'Your account has been deactivated. Contact support.'}, status=403)

    from django.utils import timezone
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])

    return Response({
        'tokens': get_tokens(user),
        'user': UserSerializer(user).data,
    })


# ── Logout ────────────────────────────────────────────────────────────────────
@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


# ── Me ────────────────────────────────────────────────────────────────────────
@api_view(['GET', 'PATCH'])
def me(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    s = UserSerializer(request.user, data=request.data, partial=True)
    if s.is_valid():
        s.save()
        return Response(s.data)
    return Response(s.errors, status=400)


# ── Change Password ───────────────────────────────────────────────────────────
@api_view(['POST'])
def change_password(request):
    s = ChangePasswordSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=400)
    if not request.user.check_password(s.validated_data['old_password']):
        return Response({'error': 'Current password is incorrect.'}, status=400)
    request.user.set_password(s.validated_data['new_password'])
    request.user.save()
    return Response({'message': 'Password changed successfully.'})


# ── Forgot Password ───────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').lower().strip()
    try:
        user = CustomUser.objects.get(email=email, is_active=True)
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        token_obj = PasswordResetToken.objects.create(user=user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token_obj.token}"
        send_mail(
            subject='Reset your CELPIP Trainer password',
            message=f"""Hi {user.full_name},

We received a request to reset your password. Click the link below:

{reset_url}

This link expires in 1 hour. If you did not request a password reset, ignore this email.

The CELPIP Trainer Team""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except CustomUser.DoesNotExist:
        pass  # Don't reveal if email exists
    return Response({'message': 'If that email is registered, you will receive a reset link shortly.'})


# ── Reset Password ────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    s = ResetPasswordSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=400)
    try:
        token_obj = PasswordResetToken.objects.get(token=s.validated_data['token'])
    except PasswordResetToken.DoesNotExist:
        return Response({'error': 'Invalid reset token.'}, status=400)
    if not token_obj.is_valid():
        return Response({'error': 'This reset link has expired. Please request a new one.'}, status=400)

    user = token_obj.user
    user.set_password(s.validated_data['password'])
    user.save()
    token_obj.used = True
    token_obj.save()
    return Response({'message': 'Password reset successfully. You can now log in.'})


# ── Admin: List Users ─────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_users(request):
    users = CustomUser.objects.all().prefetch_related('sessions')
    return Response(AdminUserSerializer(users, many=True).data)


# ── Admin: User Detail / Toggle Active ───────────────────────────────────────
@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAdminUser])
def admin_user_detail(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    if request.method == 'GET':
        return Response(AdminUserSerializer(user).data)

    # PATCH — only allow toggling is_active and is_staff
    allowed = {k: v for k, v in request.data.items() if k in ['is_active', 'is_staff']}
    for key, val in allowed.items():
        setattr(user, key, val)
    user.save()
    return Response(AdminUserSerializer(user).data)


# ── Admin: Stats ──────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    from trainer.models import PracticeSession
    return Response({
        'total_users': CustomUser.objects.count(),
        'verified_users': CustomUser.objects.filter(is_verified=True).count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'total_sessions': PracticeSession.objects.count(),
        'reading_sessions': PracticeSession.objects.filter(section='Reading').count(),
        'writing_sessions': PracticeSession.objects.filter(section='Writing').count(),
    })
