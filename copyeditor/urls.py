from django.urls import path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('database_response', views.database_response, name='database_response'), 
    path('api_response', views.api_response, name='api_resposne'),
    path('api_url', views.api_url, name='api_url')
]