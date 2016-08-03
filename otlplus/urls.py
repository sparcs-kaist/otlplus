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
from settings import BASE_DIR
import os
from django.conf.urls import (
    handler400, handler403, handler404, handler500
)

from django.conf import settings
from django.conf.urls.static import static

from apps.review import views as review_views
from django import views as django_views

handler400 = 'apps.review.views.bad_request'
handler403 = 'apps.review.views.permission_denied'
handler404 = 'apps.review.views.page_not_found'
handler500 = 'apps.review.views.server_error'

urlpatterns = [
    # Admin Page
    url(r'^admin/', include(admin.site.urls)),

    # OTLplus Apps
    url(r'^main/$', review_views.search_view),
    url(r'^tutorial_again/$', review_views.search_view_first_again),
    url(r'^tutorial/$', review_views.search_view_first),
    url(r'^tutorial2/$', review_views.search_view_first2),
    url(r'^tutorial3/$', review_views.search_view_first3),
    url(r'^tutorial4/$', review_views.search_view_first4),
    url(r'^credits/$', review_views.credits),
    url(r'^licenses/$', review_views.licenses),
    url(r'^$', lambda x: HttpResponseRedirect('/main/')),
    url(r'^session/', include('apps.session.urls')),
    url(r'^review/', include('apps.review.urls')),
    url(r'^subject/', include('apps.subject.urls')),
    url(r'^timetable/', include('apps.timetable.urls')),
] + static(r'^media/(?P<path>.*)$', document_root = os.path.join(BASE_DIR, 'static'))
    # Media Root
