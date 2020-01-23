# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect, render_to_response
from django.template import RequestContext
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, CourseFiltered, Professor, CourseUser
from apps.review.models import Review, ReviewVote, MajorBestReview, HumanityBestReview
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


# global val###

gradelist = [(0,'?'),(1,'F'),(2,'F'),(3,'F'),(4,'D-'),(5,'D'),(6,'D+'),(7,'C-'),(8,'C'),(9,'C+'),(10,'B-'),(11,'B'),(12,'B+'),(13,'A-'),(14,'A'),(15,'A+')]


# Filter Functions################################################################
def _departmentFilters(raw_filters):
    department_list = []
    for department in Department.objects.all():
        department_list.append(department.code)
    major_list = ["CE", "MSB", "MAE", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS", "MS", "NQE", "HSS", "EE", "CS", "MAE", "CH"]
    etc_list = list(set(department_list)^set(major_list))
    if ("ALL" in raw_filters) or len(raw_filters)==0 :
        return department_list
    filters = list(set(department_list) & set(raw_filters))
    if "ETC" in raw_filters:
        filters += etc_list
    return filters


def _typeFilters(raw_filters):
    acronym_dic = {'GR':'General Required', 'MGC':'Mandatory General Courses', 'BE':'Basic Elective', 'BR':'Basic Required', 'EG':'Elective(Graduate)', 'HSE':'Humanities & Social Elective', 'OE':'Other Elective', 'ME':'Major Elective', 'MR':'Major Required', 'S':'Seminar', 'I':'Interdisciplinary', 'FP':'Field Practice'}
    type_list = acronym_dic.keys()
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters = [acronym_dic[i] for i in type_list if acronym_dic.has_key(i)]
        return filters
    acronym_filters = list(set(type_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'ETC' in raw_filters:
        filters +=["Seminar", "Interdisciplinary", "Field Practice"]
    return filters


def _gradeFilters(raw_filters):
    acronym_dic = {'ALL':"", '000':"0", '100':"1", '200':"2", '300':"3", '400':"4", '500':"5", 'HIGH':"6"}
    grade_list = acronym_dic.keys()
    acronym_filters = list(set(grade_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'HIGH' in raw_filters:
        filters+=["7", "8", "9"]
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters=["0","1","2","3","4","5","6","7","8","9"]
    return filters


@login_required_ajax
def ReviewLike(request):
    body = json.loads(request.body.decode('utf-8'))

    is_login = False
    already_up = False
    likes_count = -1
    comment_id = -1
    if request.user.is_authenticated():
        is_login = True
        if request.method == 'POST':
            user = request.user
            user_profile = user.userprofile
            target_review = Review.objects.get(id=body['commentid'])
            if ReviewVote.objects.filter(comment = target_review, userprofile = user_profile).exists():
                already_up = True
            else:
                ReviewVote.cv_create(target_review,user_profile) #session 완성시 변경
            likes_count = target_review.like
    ctx = {'likes_count': likes_count, 'already_up': already_up, 'is_login':is_login, 'id': body['commentid']}
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
            comment = body['content']

    user = request.user
    user_profile = user.userprofile

    lecid = int(lecture_id)
    lecture = user_profile.getReviewWritableLectureList().get(id = lecid)

    course = lecture.course
    comment = body['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
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
        target_comment = user_profile.reviews.get(lecture=lecture)
        if target_comment.is_deleted == 0: target_comment.u_update(grade=grade, load=load, speech=speech, comment=comment)
    except Review.DoesNotExist :
        target_comment = Review.u_create(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, writer=writer)
    return JsonResponse(target_comment.toJson(), safe=False)


def latest(request, page=-1):
    page = int(page)
    PAGE_SIZE = 20

    comments = Review.objects.all().order_by('-written_datetime')

    comments = comments[PAGE_SIZE * page : PAGE_SIZE * (page+1)]

    if len(comments) == 0:
        raise Http404

    results = [i.toJson(user=request.user) for i in comments]
    return JsonResponse(results,safe=False)



