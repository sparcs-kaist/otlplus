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
    url(r'^api/table_update/$', views.table_update),
    url(r'^api/table_create/$', views.table_create),
    url(r'^api/table_delete/$', views.table_delete),
    url(r'^api/table_copy/$', views.table_copy),
    url(r'^api/table_load/$', views.table_load),
    url(r'^api/search/$', views.search),
    url(r'^api/comment_load/$', views.comment_load),
    url(r'^api/list_load_major/$', views.list_load_major),
    url(r'^api/list_load_humanity/$', views.list_load_humanity),
    url(r'^api/wishlist_load/$', views.wishlist_load),
    url(r'^api/wishlist_update/$', views.wishlist_update),
    url(r'^api/share_image/$', views.share_image),
    url(r'^api/share_calendar/$', views.share_calendar),
]
