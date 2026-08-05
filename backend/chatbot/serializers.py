from rest_framework import serializers
from .models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['id', 'user', 'session_id', 'user_message', 'ai_response', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']
