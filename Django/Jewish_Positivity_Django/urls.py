# in urls.py

from .views import login_view, create_user_view, logout_view
from django.urls import include, path
from django.contrib import admin

urlpatterns = [
    path('login/', login_view, name='login'),
    path('create_user/', create_user_view, name='create_user'),
    # path('logout/', logout_view, name='logout'),
    path('admin/', admin.site.urls),

    # path('Jewish_Positivity_Django/', include('Jewish_Positivity_Django.urls')),
]
