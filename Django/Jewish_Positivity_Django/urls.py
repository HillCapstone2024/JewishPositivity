# in urls.py

from .views import login_view, logout_view
from django.urls import include, path
from django.contrib import admin

urlpatterns = [
    #path('login/', login_view, name='login'),
    #path('logout/', logout_view, name='logout'),
    path('admin/', admin.site.urls),
    #path('timer/', include('timer.urls')),
]
