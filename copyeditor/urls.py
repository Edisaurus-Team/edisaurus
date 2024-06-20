from django.urls import path, re_path
# from django.views.generic import TemplateView
from . import views



urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('api/get_table', views.get_table, name='get_table'),
    path('api/settings', views.settings, name='settings'),
    path('api/get_article/<str:id>', views.get_article, name='get_article'),
    
    # all other paths are routed to react
    re_path(r"^(?:.*)?$", views.index, name='react_paths')
]