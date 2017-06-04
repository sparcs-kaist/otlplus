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
    url(r'^$', views.main),
    url(r'^show$', views.show_table),
    url(r'^search_temp$', views.search_temp),
    url(r'^ajax/search_temp$', views.search_temp_ajax),
    url(r'^api/update$', views.update_my_lectures),
    url(r'^api/table_delete', views.delete_my_timetable),
    url(r'^api/table_copy', views.copy_my_timetable),
    url(r'^api/show$', views.show_my_lectures),
    url(r'^update$', views.update_table),
	url(r'^wishlist$', views.wishlist),
]
