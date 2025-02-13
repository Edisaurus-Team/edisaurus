from django.urls import path, re_path
# from django.views.generic import TemplateView
from . import views


# *important note* server-side paths must match trailing slashes. <str:id> tags do not have trailing slashes for now.
# otherwise, all Django paths should have a trailing slash just to be uniform.   

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    
    # api paths
    path('api/get_table/', views.get_table, name='get_table'),
    path('api/settings/', views.settings, name='settings'),
    path('api/get_article/<str:id>', views.get_article, name='get_article'),
    path('api/create_article/', views.create_article, name='create_article'),
    path('api/workshop_api/<str:id>', views.workshop_api, name='workshop_api'),
    path('api/stream_response/', views.stream_response, name='stream_response'),
    path('api/save_article/<str:id>', views.save_article, name='save_article'),
    # **STOP FORGETTING YOUR COMMA IF YOU ADD ANOTHER URL TO THE BOTTOM OF THIS LIST**
    
    # all other paths are routed to react
    re_path(r"^(?:.*)?$", views.index, name='react_paths')
]