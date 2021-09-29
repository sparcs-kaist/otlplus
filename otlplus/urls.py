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
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render

urlpatterns = [
    # Admin Page
    url(r"^admin/", admin.site.urls),

    # Service Worker
    url(r"^index.html", lambda request: render(request, "index.html")),
    url(r"^precache-manifest.(?P<hash>\w+).js",
        lambda request, hash: render(request,
                                     f"precache-manifest.{hash}.js",
                                     content_type="application/javascript")),
    url(r"^service-worker.js",
        lambda request: render(request,
                               "service-worker.js",
                               content_type="application/javascript")),

    # OTL Plus Apps
    url(r"^session/", include("apps.session.urls")),
    url(r"^api/", include("apps.subject.urls")),
    url(r"^api/", include("apps.review.urls")),
    url(r"^api/", include("apps.timetable.urls")),
    url(r"^api/", include("apps.main.urls")),
    url(r"^api/", include("apps.support.urls")),
    url(r"^api/status$", lambda request: HttpResponse()),
    url(r"^api/", lambda request: HttpResponseNotFound("Bad url")),
    url(r"^", lambda request: render(request, "index.html")),
]
