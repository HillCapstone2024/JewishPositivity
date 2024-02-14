# in urls.py

from django.urls import include, path
from django.contrib import admin

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('Jewish_Positivity_Django/', include('Jewish_Positivity_Django.urls')),
]
