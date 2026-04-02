from django.db import models
from django.conf import settings


class PracticeSession(models.Model):
    SECTION_CHOICES = [
        ('Reading', 'Reading'),
        ('Writing', 'Writing'),
        ('Listening', 'Listening'),
        ('Speaking', 'Speaking'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    section = models.CharField(max_length=20, choices=SECTION_CHOICES)
    score = models.IntegerField()
    feedback = models.TextField(blank=True)
    response_text = models.TextField(blank=True)  # For writing tasks
    task_title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} — {self.section} — Score {self.score}"
