from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    learning_goal = models.TextField(blank=True)
    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced')
        ],
        default='beginner'
    )
    skills = models.TextField(blank=True, default='')
    career = models.CharField(max_length=255, blank=True, default='')
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True, default='')
    # Gamification fields
    xp = models.IntegerField(default=0)
    daily_xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak = models.IntegerField(default=0)
    last_activity = models.DateField(null=True, blank=True)
    total_resources_completed = models.IntegerField(default=0)
    total_weeks_completed = models.IntegerField(default=0)
    total_roadmaps_completed = models.IntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def add_xp(self, amount):
        self.update_streak()
        self.xp += amount
        self.daily_xp = amount
        self.level = self.calculate_level()
        self.save()

    def calculate_level(self):
        if self.xp < 100: return 1
        elif self.xp < 500: return 2
        elif self.xp >= 10000: return 22
        return (self.xp // 500) + 2

    def update_streak(self):
        today = timezone.now().date()
        if self.last_activity is None:
            self.streak = 1
        elif self.last_activity == today:
            pass
        elif (today - self.last_activity).days == 1:
            self.streak += 1
        else:
            self.streak = 1
        self.last_activity = today

    def get_level_title(self):
        if self.level == 1: return 'Beginner'
        elif self.level == 2: return 'Learner'
        elif self.level <= 5: return 'Student'
        elif self.level <= 8: return 'Intermediate'
        elif self.level <= 11: return 'Advanced'
        elif self.level <= 14: return 'Practitioner'
        elif self.level <= 17: return 'Specialist'
        elif self.level <= 19: return 'Expert'
        elif self.level <= 21: return 'Master'
        else: return 'Pro'

    def xp_for_next_level(self):
        if self.level == 1: return 100
        elif self.level == 2: return 500
        elif self.level >= 21: return 10000
        return (self.level - 1) * 500

    def xp_for_current_level(self):
        if self.level == 1: return 0
        elif self.level == 2: return 100
        elif self.level >= 22: return 10000
        return (self.level - 2) * 500


class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"

class OTPCode(models.Model):
    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('reset', 'Password Reset'),
        ('register', 'Registration'),
    ]
    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        # Expires in 15 minutes
        expiration_time = self.created_at + timezone.timedelta(minutes=15)
        return timezone.now() > expiration_time

    def __str__(self):
        return f"{self.email} - {self.code} ({self.purpose})"