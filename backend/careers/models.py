from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CVAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cv_analyses')
    target_role = models.CharField(max_length=255)
    job_description = models.TextField(blank=True, null=True)
    ats_score = models.IntegerField(default=0)
    feedback_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

class MockInterview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mock_interviews')
    job_role = models.CharField(max_length=255)
    skills = models.CharField(max_length=500, blank=True)
    job_description = models.TextField(blank=True, null=True)
    questions_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
