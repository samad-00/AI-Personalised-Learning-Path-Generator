from django.db import models
from django.conf import settings
import uuid
class Roadmap(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmaps')
    goal = models.CharField(max_length=500)
    experience_level = models.CharField(max_length=20, default='beginner')
    topics_overview = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True)
    def __str__(self):
        return f"{self.user.email} - {self.goal}"

class Week(models.Model):
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='weeks')
    week_number = models.IntegerField()
    title = models.CharField(max_length=200)
    objective = models.TextField()
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['week_number']

    def __str__(self):
        return f"Week {self.week_number}: {self.title}"

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('video', 'Video'),
        ('article', 'Article'),
        ('book', 'Book'),
        ('exercise', 'Exercise'),
    ]
    week = models.ForeignKey(Week, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=300)
    url = models.URLField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=50, blank=True)
    is_completed = models.BooleanField(default=False)
    difficulty_rating = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return self.title