from django.urls import path
from .views import ChatAPIView, ChatHistoryAPIView

urlpatterns = [
    path('', ChatAPIView.as_view(), name='chat'),
    path('history/', ChatHistoryAPIView.as_view(), name='chat-history'),
]
