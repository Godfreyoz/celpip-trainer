import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    # CELPIP specific
    target_clb = models.IntegerField(default=9)
    current_reading = models.IntegerField(null=True, blank=True)
    current_writing = models.IntegerField(null=True, blank=True)
    current_listening = models.IntegerField(null=True, blank=True)
    current_speaking = models.IntegerField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def is_pr_ready(self):
        scores = [self.current_reading, self.current_writing, self.current_listening, self.current_speaking]
        return all(s and s >= self.target_clb for s in scores)


class EmailVerificationToken(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='verification_token')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        from datetime import timedelta
        return timezone.now() < self.created_at + timedelta(hours=24)

    def __str__(self):
        return f"Verification token for {self.user.email}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        from datetime import timedelta
        return not self.used and timezone.now() < self.created_at + timedelta(hours=1)

    def __str__(self):
        return f"Reset token for {self.user.email}"
