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
    url(r"^semesters$", views.SemesterListView.as_view()),
    url(r"^courses$", views.CourseListView.as_view()),
    url(r"^courses/(?P<course_id>\d+)$", views.CourseInstanceView.as_view()),
    url(r"^courses/autocomplete$", views.CourseListAutocompleteView.as_view()),
    url(r"^courses/(?P<course_id>\d+)/reviews$", views.CourseInstanceReviewsView.as_view()),
    url(r"^courses/(?P<course_id>\d+)/lectures$", views.CourseInstanceLecturesView.as_view()),
    url(r"^courses/(?P<course_id>\d+)/read$", views.CourseInstanceReadView.as_view()),
    url(r"^lectures$", views.LectureListView.as_view()),
    url(r"^lectures/(?P<lecture_id>\d+)$", views.LectureInstanceView.as_view()),
    url(r"^lectures/autocomplete$", views.LectureListAutocompleteView.as_view()),
    url(r"^lectures/(?P<lecture_id>\d+)/reviews$", views.LectureInstanceReviewsView.as_view()),
    url(r"^lectures/(?P<lecture_id>\d+)/related-reviews$",
        views.LectureInstanceRelatedReviewsView.as_view()),
    url(r"^users/(?P<user_id>\d+)/taken-courses$", views.UserInstanceTakenCoursesView.as_view()),
]
