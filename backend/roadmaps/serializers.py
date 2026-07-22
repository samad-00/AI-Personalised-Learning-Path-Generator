from rest_framework import serializers
from .models import Roadmap, Week, Resource

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class WeekSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Week
        fields = '__all__'

class RoadmapSerializer(serializers.ModelSerializer):
    weeks = WeekSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']