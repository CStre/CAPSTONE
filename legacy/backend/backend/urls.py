from django.contrib import admin
from django.urls import path
from . import views
from .views import CreateUserView, LoginView, logout_view, UserDetailView, get_image_urls, process


from django.urls import path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('', views.index),  #Root URL for REACT
    path('admin/', admin.site.urls), #For the Django Administrator Backend
    path('register/', CreateUserView.as_view(), name='register'), #For API Register Request
    path('login/', LoginView.as_view(), name='login'), #For API Login Request
    path('user-info/', UserDetailView.as_view(), name='user-info'), #For API Username and Name Fetch
    path('logout/', logout_view, name='logout'), #For API Logout Request
    path('delete-account/', views.delete_account, name='delete_account'),
    path('api/get-images/', get_image_urls, name='get-images'),
    path('api/process-interactions/', process, name='/process-interactions'),

    # Catch-all pattern for 404 page
    # This needs to be the last pattern in the urlpatterns list
   re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
