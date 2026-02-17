"""
URL configuration for the api app.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Score computation endpoints
    path('compute-scores/', views.compute_scores, name='compute_scores'),
    path('compute-score/', views.compute_single_score, name='compute_single_score'),
]
