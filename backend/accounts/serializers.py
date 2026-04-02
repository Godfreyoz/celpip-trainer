from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'is_verified', 'is_active',
            'is_staff', 'date_joined', 'target_clb',
            'current_reading', 'current_writing',
            'current_listening', 'current_speaking', 'is_pr_ready',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'is_staff', 'date_joined', 'is_pr_ready']


class AdminUserSerializer(serializers.ModelSerializer):
    session_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'is_verified', 'is_active',
            'is_staff', 'date_joined', 'last_login',
            'current_reading', 'current_writing',
            'current_listening', 'current_speaking',
            'session_count',
        ]

    def get_session_count(self, obj):
        return obj.sessions.count()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
