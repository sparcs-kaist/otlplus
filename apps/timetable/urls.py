"""otlplus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import url
from django.http import HttpResponseRedirect
from . import views

urlpatterns = [
    url(r'^users/(?P<user_id>\d+)/timetables$', views.user_instance_timetable_list_view),
    url(r'^users/(?P<user_id>\d+)/timetables/(?P<timetable_id>\d+)$', views.user_instance_timetable_instance_view),
    url(r'^timetable/table_update$', views.table_update),
    url(r'^timetable/wishlist_load$', views.wishlist_load),
    url(r'^timetable/wishlist_update$', views.wishlist_update),
    url(r'^timetable/share_image$', views.share_image),
    url(r'^timetable/share_calendar$', views.share_calendar),
    url(r'^external/google/google_auth_return$', views.google_auth_return),
]
