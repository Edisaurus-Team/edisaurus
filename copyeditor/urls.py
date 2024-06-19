from django.urls import path, re_path
# from django.views.generic import TemplateView
from . import views



urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('home/', views.index, name='home'),
    path('workshop/', views.index, name='workshop'),
    path('api/', views.api, name='api'),
    
    # all other paths are routed to react
    re_path(r"^(?:.*)?$", views.index, name='react_paths')

]