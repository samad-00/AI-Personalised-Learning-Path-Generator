from django.urls import path
from .views import (
    GenerateRoadmapView, RoadmapListView, RoadmapDetailView,
    RateResourceView, RegenerateWeekView, LeaderboardView,
    SaveNotesView, SharedRoadmapView, ResourceSearchView,
    ExportRoadmapPDFView
)

urlpatterns = [
    path('generate/', GenerateRoadmapView.as_view(), name='generate-roadmap'),
    path('', RoadmapListView.as_view(), name='roadmap-list'),
    path('<int:pk>/', RoadmapDetailView.as_view(), name='roadmap-detail'),
    path('<int:pk>/export-pdf/', ExportRoadmapPDFView.as_view(), name='export-pdf'),
    path('resource/<int:resource_id>/rate/', RateResourceView.as_view(), name='rate-resource'),
    path('resource/<int:resource_id>/notes/', SaveNotesView.as_view(), name='save-notes'),
    path('week/<int:week_id>/regenerate/', RegenerateWeekView.as_view(), name='regenerate-week'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('shared/<uuid:share_token>/', SharedRoadmapView.as_view(), name='shared-roadmap'),
    path('search/', ResourceSearchView.as_view(), name='resource-search'),
]