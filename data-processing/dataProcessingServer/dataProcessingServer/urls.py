from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthCheck', lambda request: HttpResponse('Hello World!')),
    path('api/', include('api.urls')),
]
