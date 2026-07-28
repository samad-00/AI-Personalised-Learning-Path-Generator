from django.urls import path
from . import views

urlpatterns = [
    path('mock-interview/', views.GenerateMockInterviewView.as_view(), name='mock-interview'),
    path('cv-analyze/', views.AnalyzeCVView.as_view(), name='cv-analyze'),
    path('execute/', views.ExecuteCodeView.as_view(), name='execute-code'),
]
