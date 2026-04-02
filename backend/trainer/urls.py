from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.my_sessions, name='my-sessions'),
    path('sessions/save/', views.save_session, name='save-session'),
    path('ai/writing-feedback/', views.ai_writing_feedback, name='ai-writing-feedback'),
    path('ai/reading-feedback/', views.ai_reading_feedback, name='ai-reading-feedback'),
    path('ai/improvement-task/', views.ai_improvement_task, name='ai-improvement-task'),
    path('ai/check-improvement/', views.ai_check_improvement, name='ai-check-improvement'),
]
