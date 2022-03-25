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

import apps.session.views as session_views
import apps.main.views as main_views
import apps.review.views as review_views
import apps.subject.views as subject_views
import apps.support.views as support_views
import apps.timetable.views as timetable_views
import apps.planner.views as planner_views


urlpatterns = [
    # Admin Page
    url(r"^admin/", admin.site.urls),

    # Service Worker
    url(r"^index.html$", lambda request: render(request, "index.html")),
    url(r"^precache-manifest.(?P<hash>\w+).js$",
        lambda request, hash: render(request,
                                     f"precache-manifest.{hash}.js",
                                     content_type="application/javascript")),
    url(r"^service-worker.js$",
        lambda request: render(request,
                               "service-worker.js",
                               content_type="application/javascript")),
    url(r"^service-worker.js.map$",
        lambda request: render(request,
                               "service-worker.js.map",
                               content_type="application/json")),
    url(r"^workbox-(?P<hash>\w+).js$",
        lambda request, hash: render(request,
                                     f"workbox-{hash}.js",
                                     content_type="application/javascript")),
    url(r"^workbox-(?P<hash>\w+).js.map$",
        lambda request, hash: render(request,
                                     f"workbox-{hash}.js.map",
                                     content_type="application/json")),

    # Session
    url(r"^session/$",
        session_views.home),
    url(r"^session/login/$",
        session_views.user_login),
    url(r"^session/login/callback",
        session_views.login_callback),
    url(r"^session/logout/$",
        session_views.user_logout),
    url(r"^session/unregister/$",
        session_views.unregister),
    url(r"^session/department-options$",
        session_views.department_options),
    url(r"^session/favorite-departments$",
        session_views.favorite_departments),
    url(r"^session/info",
        session_views.info),
    # url(r"^session/unregister/callback/$",
    #     session_views.unregister_callback),

    # APIs
    url(r"^api/users/(?P<user_id>\d+)/feeds$",
        main_views.UserInstanceFeedsView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/liked-reviews$",
        review_views.UserInstanceLikedReviewsView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/taken-courses$",
        subject_views.UserInstanceTakenCoursesView.as_view()),

    url(r"^api/users/(?P<user_id>\d+)/timetables$",
        timetable_views.UserInstanceTimetableListView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/timetables/(?P<timetable_id>\d+)$",
        timetable_views.UserInstanceTimetableInstanceView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/timetables/(?P<timetable_id>\d+)/add-lecture$",
        timetable_views.UserInstanceTimetableInstanceAddLectureView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/timetables/(?P<timetable_id>\d+)/remove-lecture$",
        timetable_views.UserInstanceTimetableInstanceRemoveLectureView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/timetables/(?P<timetable_id>\d+)/reorder",
        timetable_views.UserInstanceTimetableInstanceReorderView.as_view()),
    
    url(r"^api/users/(?P<user_id>\d+)/planners/(?P<planner_id>\d+)$",
        planner_views.UserInstancePlannerInstanceAddPlannerItemView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/planners/(?P<planner_id>\d+)/planner-item/(?P<planner_id>\d+)$",
        planner_views.UserInstancePlannerInstancePlannerItemView.as_view()),

    url(r"^api/users/(?P<user_id>\d+)/wishlist$",
        timetable_views.UserInstanceWishlistView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/wishlist/add-lecture$",
        timetable_views.UserInstanceWishlistAddLectureView.as_view()),
    url(r"^api/users/(?P<user_id>\d+)/wishlist/remove-lecture$",
        timetable_views.UserInstanceWishlistRemoveLectureView.as_view()),

    url(r"^api/reviews$",
        review_views.ReviewListView.as_view()),
    url(r"^api/reviews/(?P<review_id>\d+)$",
        review_views.ReviewInstanceView.as_view()),
    url(r"^api/reviews/(?P<review_id>\d+)/like$",
        review_views.ReviewInstanceLikeView.as_view()),

    url(r"^api/semesters$", subject_views.SemesterListView.as_view()),

    url(r"^api/courses$",
        subject_views.CourseListView.as_view()),
    url(r"^api/courses/(?P<course_id>\d+)$",
        subject_views.CourseInstanceView.as_view()),
    url(r"^api/courses/autocomplete$",
        subject_views.CourseListAutocompleteView.as_view()),
    url(r"^api/courses/(?P<course_id>\d+)/reviews$",
        subject_views.CourseInstanceReviewsView.as_view()),
    url(r"^api/courses/(?P<course_id>\d+)/lectures$",
        subject_views.CourseInstanceLecturesView.as_view()),
    url(r"^api/courses/(?P<course_id>\d+)/read$",
        subject_views.CourseInstanceReadView.as_view()),

    url(r"^api/lectures$",
        subject_views.LectureListView.as_view()),
    url(r"^api/lectures/(?P<lecture_id>\d+)$",
        subject_views.LectureInstanceView.as_view()),
    url(r"^api/lectures/autocomplete$",
        subject_views.LectureListAutocompleteView.as_view()),
    url(r"^api/lectures/(?P<lecture_id>\d+)/reviews$",
        subject_views.LectureInstanceReviewsView.as_view()),
    url(r"^api/lectures/(?P<lecture_id>\d+)/related-reviews$",
        subject_views.LectureInstanceRelatedReviewsView.as_view()),

    url(r"^api/notices$",
        support_views.NoticeListView.as_view()),

    url(r"^api/rates$",
        support_views.RateListView.as_view()),

    url(r"^api/share/timetable/image$",
        timetable_views.ShareTimetableImageView.as_view()),
    url(r"^api/share/timetable/calendar$",
        timetable_views.ShareTimetableCalendarView.as_view()),
    url(r"^api/share/timetable/ical$",
        timetable_views.ShareTimetableIcalView.as_view()),

    # url(r"^api/external/google/google_auth_return$",
    #     timetable_views.external_google_google_auth_return_view),

    url(r"^api/status$", lambda request: HttpResponse()),
    url(r"^api/", lambda request: HttpResponseNotFound("Bad url")),
    url(r"^", lambda request: render(request, "index.html")),
]
