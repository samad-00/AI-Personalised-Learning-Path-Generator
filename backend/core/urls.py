from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/roadmaps/', include('roadmaps.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/adaptation/', include('adaptation.urls')),
    path('api/careers/', include('careers.urls')),
]