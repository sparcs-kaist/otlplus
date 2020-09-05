# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect, render_to_response
from django.template import RequestContext

from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, Professor, CourseUser
from apps.review.models import Review, ReviewVote, MajorBestReview, HumanityBestReview
from apps.common.util import getint, order_queryset, paginate_queryset

from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest, JsonResponse, Http404
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from math import exp
from itertools import groupby
from django.core.paginator import Paginator, InvalidPage
from django.core import serializers
from utils.decorators import login_required_ajax
import json
#testend
import random
import os
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.conf import settings



@login_required_ajax
def ReviewLike(request):
    body = json.loads(request.body.decode('utf-8'))

    is_login = False
    already_up = False
    likes_count = -1
    if request.user.is_authenticated():
        is_login = True
        if request.method == 'POST':
            user = request.user
            user_profile = user.userprofile
            target_review = Review.objects.get(id=body['reviewid'])
            if ReviewVote.objects.filter(review = target_review, userprofile = user_profile).exists():
                already_up = True
            else:
                ReviewVote.objects.create(review=target_review, userprofile=user_profile) #session 완성시 변경
            likes_count = target_review.like
    ctx = {'likes_count': likes_count, 'already_up': already_up, 'is_login':is_login, 'id': body['reviewid']}
    return JsonResponse(ctx,safe=False)


@login_required(login_url='/session/login/')
def read_course(request):
    user = request.user
    user_profile = user.userprofile
    body = json.loads(request.body.decode('utf-8'))
    course_id = int(body['id'])
    course = Course.objects.get(id=course_id)
    try:
        course_user = CourseUser.objects.get(user_profile=user_profile, course=course)
        course_user.save()
    except CourseUser.DoesNotExist:
        CourseUser.objects.create(user_profile=user_profile, course=course)
    return JsonResponse({}, safe=False)


@login_required_ajax
@require_http_methods(['POST'])
def insertReview(request,lecture_id):
    body = json.loads(request.body.decode('utf-8'))

    if body.has_key('content') == False:
        return HttpResponseBadRequest('후기를 입력해주세요.')
    else:
        if len(body['content']) == 0:
            return HttpResponseBadRequest('1글자 이상 입력해주세요.')
        else:
            content = body['content']

    user = request.user
    user_profile = user.userprofile

    lecid = int(lecture_id)
    lecture = user_profile.getReviewWritableLectureList().get(id = lecid)

    course = lecture.course
    content = body['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = int(body['gradescore'])
    if not 1<=grade<=5:
        return HttpResponseBadRequest
    load = int(body['loadscore'])
    if not 1<=load<=5:
        return HttpResponseBadRequest
    speech = int(body['speechscore'])
    if not 1<=speech<=5:
        return HttpResponseBadRequest
    total = (grade+load+speech)/3.0
    writer = user_profile #session 완성시 변경

    try :
        target_review = user_profile.reviews.get(lecture=lecture)
        if target_review.is_deleted == 0:
            target_review.grade = grade
            target_review.load = load
            target_review.speech = speech
            target_review.content = content
            target_review.save()
    except Review.DoesNotExist :
        target_review = Review.objects.create(course=course, lecture=lecture, content=content, grade=grade, load=load, speech=speech, writer=writer)
    return JsonResponse(target_review.toJson(), safe=False)


@require_http_methods(['GET'])
def review_list_view(request):
    MAX_LIMIT = 50

    if request.method == 'GET':
        reviews = Review.objects.all()

        order = request.GET.getlist('order', [])
        order_queryset(reviews, order)

        reviews = reviews \
            .distinct()

        offset = getint(request.GET, 'offset', None)
        limit = getint(request.GET, 'limit', None)
        reviews = paginate_queryset(reviews, offset, limit, MAX_LIMIT)

        result = [r.toJson(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)



