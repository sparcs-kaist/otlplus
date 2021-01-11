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
    url(r'^reviews$', views.review_list_view),
    url(r'^reviews/(?P<review_id>\d+)$', views.review_instance_view),
    url(r'^reviews/(?P<review_id>\d+)/like$', views.review_instance_like_view),
    url(r'^users/(?P<user_id>\d+)/liked-reviews$', views.user_instance_liked_reviews_view),
]
