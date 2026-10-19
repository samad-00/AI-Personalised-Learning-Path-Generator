from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def ping(request):
    return JsonResponse({"status": "ok", "message": "pong"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ping', ping),  # Keep-alive endpoint for cron job
    path('api/accounts/', include('accounts.urls')),
    path('api/roadmaps/', include('roadmaps.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/adaptation/', include('adaptation.urls')),
    path('api/careers/', include('careers.urls')),
    path('api/chat/', include('chatbot.urls')),
]