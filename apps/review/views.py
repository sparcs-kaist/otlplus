# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect, render_to_response, get_object_or_404
from django.template import RequestContext

from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, Professor, CourseUser
from .models import Review, ReviewVote, MajorBestReview, HumanityBestReview
from utils.util import getint, get_ordered_queryset, get_paginated_queryset, patch_object

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
from django.http import QueryDict



@require_http_methods(['GET', 'POST'])
def review_list_view(request):
    MAX_LIMIT = 50

    if request.method == 'GET':
        reviews = Review.objects.all()

        order = request.GET.getlist('order', [])
        reviews = get_ordered_queryset(reviews, order)

        reviews = reviews \
            .distinct()

        offset = getint(request.GET, 'offset', None)
        limit = getint(request.GET, 'limit', None)
        reviews = get_paginated_queryset(reviews, offset, limit, MAX_LIMIT)

        result = [r.toJson(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)

    elif request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        user = request.user
        if not (user and user.is_authenticated()):
            return HttpResponse(status=401)

        content = body.get('content', '')
        if not (content and len(content)):
            return HttpResponseBadRequest('Missing or empty field \'content\' in request data')
        
        lecture_id = body.get('lecture', None)
        if not lecture_id:
            return HttpResponseBadRequest('Missing field \'lecture\' in request data')

        grade = getint(body, 'grade')
        load = getint(body, 'load')
        speech = getint(body, 'speech')
        if not (
            1 <= grade <= 5
            and 1 <= load <= 5
            and 1 <= speech <= 5
        ):
            return HttpResponseBadRequest('Wrong field(s) \'grade\', \'load\', and/or \'speech\' in request data')

        user_profile = user.userprofile
        lecture = user_profile.getReviewWritableLectureList().get(id = lecture_id)
        course = lecture.course

        review = Review.objects.create(course=course, lecture=lecture, content=content, grade=grade, load=load, speech=speech, writer=user_profile)
        return JsonResponse(review.toJson(user=request.user), safe=False)


@require_http_methods(['GET', 'PATCH'])
def review_instance_view(request, review_id):
    review = get_object_or_404(Review, id=review_id)

    if request.method == 'GET':
        result = review.toJson(user=request.user)
        return JsonResponse(result)


    elif request.method == 'PATCH':
        body = json.loads(request.body.decode('utf-8'))

        user = request.user
        if not (user and user.is_authenticated()):
            return HttpResponse(status=401)
        if not review.writer == user.userprofile:
            return HttpResponse(status=401)

        if review.is_deleted:
            return HttpResponseBadRequest('Target review deleted by admin')

        content = body.get('content', None)
        if not len(content):
            return HttpResponseBadRequest('Empty field \'content\' in request data')

        grade = getint(body, 'grade', None)
        load = getint(body, 'load', None)
        speech = getint(body, 'speech', None)
        if not (
            1 <= grade <= 5
            and 1 <= load <= 5
            and 1 <= speech <= 5
        ):
            return HttpResponseBadRequest('Wrong field(s) \'grade\', \'load\', and/or \'speech\' in request data')

        patch_object(review, {
            'content': content,
            'grade': grade,
            'load': load,
            'speech': speech,
        })
        return JsonResponse(review.toJson(user=request.user), safe=False)


@login_required_ajax
@require_http_methods(['POST'])
def review_instance_like_view(request, review_id):
    review = get_object_or_404(Review, id=review_id)

    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        user = request.user
        user_profile = user.userprofile

        if review.votes.filter(userprofile = user_profile).exists():
            return HttpResponseBadRequest('Already Liked')
        
        ReviewVote.objects.create(review=review, userprofile=user_profile)
        return HttpResponse()
