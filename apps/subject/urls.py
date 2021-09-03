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
from . import views

urlpatterns = [
    url(r"^semesters$", views.semester_list_view),
    url(r"^courses$", views.course_list_view),
    url(r"^courses/(?P<course_id>\d+)$", views.course_instance_view),
    url(r"^courses/autocomplete$", views.course_list_autocomplete_view),
    url(r"^courses/(?P<course_id>\d+)/reviews$", views.course_instance_reviews_view),
    url(r"^courses/(?P<course_id>\d+)/lectures$", views.course_instance_lectures_view),
    url(r"^courses/(?P<course_id>\d+)/read$", views.course_instance_read_view),
    url(r"^lectures$", views.lecture_list_view),
    url(r"^lectures/(?P<lecture_id>\d+)$", views.lecture_instance_view),
    url(r"^lectures/autocomplete$", views.lecture_list_autocomplete_view),
    url(r"^lectures/(?P<lecture_id>\d+)/reviews$", views.lecture_instance_reviews_view),
    url(r"^lectures/(?P<lecture_id>\d+)/related-reviews$", views.lecture_instance_related_reviews_view),
    url(r"^users/(?P<user_id>\d+)/taken-courses$", views.user_instance_taken_courses_view),
]
