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
    url(r'^$', views.home),
    url(r'^login/$', views.user_login),
    url(r'^login/callback/$', views.login_callback),
    url(r'^logout/$', views.user_logout),
    url(r'^unregister/$', views.unregister),
    url(r'^language/$', views.language),
    #url(r'^unregister/callback/$', views.unregister_callback),

    # User Preferences (e.g Favorite Department, Language)
    url(r'^settings/$', views.user_settings),
]
