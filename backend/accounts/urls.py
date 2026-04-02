from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('resend-verification/', views.resend_verification, name='resend-verification'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.me, name='me'),
    path('change-password/', views.change_password, name='change-password'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/', views.reset_password, name='reset-password'),

    # Admin endpoints
    path('admin/users/', views.admin_users, name='admin-users'),
    path('admin/users/<uuid:user_id>/', views.admin_user_detail, name='admin-user-detail'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
]
