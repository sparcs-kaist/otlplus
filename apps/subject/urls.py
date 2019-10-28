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
from django.conf.urls import include, url
from django.contrib import admin
from django.http import HttpResponseRedirect
from . import views

urlpatterns = [
    url(r'^courses$', views.courses_list_view),
    url(r'^courses/(?P<course_id>\d+)$', views.courses_intance_view),
    url(r'^courses/autocomplete$', views.courses_list_autocomplete_view),
    url(r'^lectures$', views.lectures_list_view),
    url(r'^lectures/(?P<lecture_id>\d+)$', views.lectures_intance_view),
    url(r'^lectures/autocomplete$', views.lectures_list_autocomplete_view),
]
