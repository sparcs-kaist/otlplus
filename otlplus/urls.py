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
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound
from django.shortcuts import render
from .settings import BASE_DIR
import os

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

from apps.review import views as review_views
from apps.timetable import views as timetable_views
from django import views as django_views
from django.views import static as django_static

from apps.main import views as mainViews

urlpatterns = [
    # Admin Page
    url(r'^admin/', admin.site.urls),

    # OTLplus Apps
    url(r'^session/', include('apps.session.urls')),
    url(r'^api/', include('apps.subject.urls')),
    url(r'^api/', include('apps.review.urls')),
    url(r'^api/', include('apps.timetable.urls')),
    url(r'^api/', include('apps.main.urls')),
    url(r'^api/', include('apps.support.urls')),
    url(r'^api/status$', lambda request: HttpResponse()),
    url(r'^api/', lambda request: HttpResponseNotFound('Bad url')),
    url(r'^', lambda request: render(request, 'index.html')),
]
