from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Badge

User = get_user_model()

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'emoji', 'earned_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'learning_goal', 'experience_level']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            learning_goal=validated_data.get('learning_goal', ''),
            experience_level=validated_data.get('experience_level', 'beginner'),
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    badges = BadgeSerializer(many=True, read_only=True)
    level_title = serializers.SerializerMethodField()
    xp_for_next_level = serializers.SerializerMethodField()
    xp_for_current_level = serializers.SerializerMethodField()
    xp_progress_pct = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'learning_goal', 'experience_level',
            'skills', 'career', 'dob', 'gender',
            'date_joined', 'xp', 'level', 'streak', 'last_activity',
            'total_resources_completed', 'total_weeks_completed',
            'total_roadmaps_completed', 'badges', 'level_title',
            'xp_for_next_level', 'xp_for_current_level', 'xp_progress_pct'
        ]
        read_only_fields = ['id', 'date_joined', 'xp', 'level', 'streak']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def get_level_title(self, obj):
        return obj.get_level_title()

    def get_xp_for_next_level(self, obj):
        return obj.xp_for_next_level()

    def get_xp_for_current_level(self, obj):
        return obj.xp_for_current_level()

    def get_xp_progress_pct(self, obj):
        current = obj.xp_for_current_level()
        next_lvl = obj.xp_for_next_level()
        if next_lvl == current:
            return 100
        return round((obj.xp - current) / (next_lvl - current) * 100)