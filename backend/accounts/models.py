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
        self.xp += amount
        self.level = self.calculate_level()
        self.update_streak()
        self.save()

    def calculate_level(self):
        if self.xp < 100: return 1
        elif self.xp < 300: return 2
        elif self.xp < 600: return 3
        elif self.xp < 1000: return 4
        elif self.xp < 1500: return 5
        elif self.xp < 2500: return 6
        elif self.xp < 4000: return 7
        elif self.xp < 6000: return 8
        elif self.xp < 9000: return 9
        else: return 10

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
        titles = {
            1: 'Novice', 2: 'Apprentice', 3: 'Student',
            4: 'Scholar', 5: 'Adept', 6: 'Expert',
            7: 'Master', 8: 'Grandmaster', 9: 'Legend', 10: 'GOD'
        }
        return titles.get(self.level, 'Novice')

    def xp_for_next_level(self):
        thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 99999]
        return thresholds[min(self.level, 10)]

    def xp_for_current_level(self):
        thresholds = [0, 0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000]
        return thresholds[min(self.level, 10)]


class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"