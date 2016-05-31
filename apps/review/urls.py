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


urlpatterns = [
    url(r'^$', 'apps.review.views.LastCommentView'),
    url(r'^json/(?P<page>[0-9]+)/$', 'apps.review.views.LastCommentView_json'),
    url(r'^result/comment/([1-9][0-9]*)/$', 'apps.review.views.ReviewView'),
    url(r'^result/professor/([1-9][0-9]*)/$', lambda x,y :HttpResponseRedirect('./-1/')),
    url(r'^result/professor/([1-9][0-9]*)/([^/]+)/$', 'apps.review.views.SearchResultProfessorView'),
    url(r'^result/professor/([^/]+)/json/([^/]+)/([^/]+)/$', 'apps.review.views.SearchResultProfessorView_json'),
    url(r'^result/course/([1-9][0-9]*)/$', lambda x,y :HttpResponseRedirect('./-1/')),
    url(r'^result/course/([1-9][0-9]*)/([^/]+)/$', 'apps.review.views.SearchResultCourseView'),
    url(r'^result/course/([^/]+)/([^/]+)/json/([^/]+)/$', 'apps.review.views.SearchResultCourseView_json'),
    url(r'^result/$', 'apps.review.views.SearchResultView', name="search_result_page"),
    url(r'^result/json/(?P<page>[0-9]+)/$', 'apps.review.views.SearchResultView_json'),
    url(r'^insert/$', 'apps.review.views.ReviewInsertView'),
    url(r'^insert/([^/]+)/([^/]+)/add/$', 'apps.review.views.ReviewInsertAdd'),
    url(r'^insert/([^/]+)/([^/]+)/$', 'apps.review.views.ReviewInsertView'),
    url(r'^delete/$','apps.review.views.ReviewDelete'),
    url(r'^like/$','apps.review.views.ReviewLike'),
    url(r'^refresh/$','apps.review.views.ReviewRefresh'),
    url(r'^portal/$','apps.review.views.ReviewPortal'),
]
