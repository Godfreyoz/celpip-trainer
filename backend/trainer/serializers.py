from rest_framework import serializers
from .models import PracticeSession


class PracticeSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeSession
        fields = ['id', 'section', 'score', 'feedback', 'response_text', 'task_title', 'created_at']
        read_only_fields = ['id', 'created_at']
