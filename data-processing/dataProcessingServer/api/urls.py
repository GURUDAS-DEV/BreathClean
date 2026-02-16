from django.urls import path
from django.http import HttpResponse
from api import views

urlpatterns = [
   path('myRoute', views.myRoute)
]
