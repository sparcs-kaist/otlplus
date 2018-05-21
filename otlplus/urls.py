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
from django.http import HttpResponseRedirect, HttpResponseNotFound
from settings import BASE_DIR
import os

from django.conf import settings
from django.conf.urls.static import static

from apps.review import views as review_views
from apps.timetable import views as timetable_views
from django import views as django_views
from django.views import static as django_static

from django.views.generic import TemplateView

urlpatterns = [
    # Admin Page
    url(r'^admin/', include(admin.site.urls)),

    # OTLplus Apps
    url(r'^session/', include('apps.session.urls')),
    url(r'^api/review/', include('apps.review.urls')),
    url(r'^api/timetable/', include('apps.timetable.urls')),
    url(r'^api/', lambda request: HttpResponseNotFound('Bad url')),
    url(r'^', TemplateView.as_view(template_name='index.html')),
]
