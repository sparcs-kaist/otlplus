# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect, render_to_response
from django.template import RequestContext
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, CourseFiltered, Professor, CourseUser
from apps.review.models import Comment,CommentVote, MajorBestComment, LiberalBestComment
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


#################### UNUSED ####################
def search_view(request):
    if request.user.is_authenticated():
        user_profile = UserProfile.objects.get(user=request.user)
        if len(user_profile.language) == 0:
            return redirect("/session/settings/")

    comment_liberal = list(LiberalBestComment.objects.all())
    if request.user.is_authenticated():
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        comment_major = list(MajorBestComment.objects.filter(comment__course__department__code__in = [d.code for d in user_profile.favorite_departments.all()]))
    else:
        comment_major = list(MajorBestComment.objects.all())

    liberal_comment = []
    major_comment = []

    for i in range(3):
        try :
            j = random.randint(0, len(comment_liberal)-1)
            comment = comment_liberal[j].comment
            context = comment.toJson(user=request.user)
            liberal_comment.append(context)
            comment_liberal.pop(j)

        except Exception, e:
            print e

    for i in range(3):
        try:
            j = random.randint(0,len(comment_major)-1)

            comment = comment_major[j].comment
            context = comment.toJson(user=request.user)
            major_comment.append(context)
            comment_major.pop(j)

        except Exception, e:
            print e
    ctx = {
            'liberal_comment':liberal_comment,
            'major_comment':major_comment,
    }

    return render(request, 'review/search.html',ctx)


def _calcAvgScore(grade_sum, load_sum, speech_sum, total_sum, comment_num):
    if comment_num == 0:
        grade = 0.0
        load = 0.0
        speech = 0.0
        total = 0.0
    else:
        grade = float(grade_sum)/comment_num
        load = float(load_sum)/comment_num
        speech = float(speech_sum)/comment_num
        total = float(total_sum)/comment_num
    return grade, load, speech, total


def _getFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword):
    if len(semester_filters)==0 or ("ALL" in semester_filters):
        courses = Course.objects.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)
    else :
        courses = CourseFiltered.objects.get(title=semester_filters[0]).courses.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)

    if len(keyword)>0:
        courses = courses.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__iexact=keyword) | Q(department__name__iexact=keyword) | Q(department__name_en__iexact=keyword))

    return courses


def _keyLecByProf(lecture):
    return sorted([i.id for i in lecture.professors.all()])


def _getLecByProf(lectures):
    lectures.sort(key = _keyLecByProf)
    lec_by_prof = groupby(lectures, _keyLecByProf)
    lec_by_prof = [ list(i[1]) for i in lec_by_prof ]
    return lec_by_prof


def resultProfessor(request):
    keyword = request.GET.get('q')
    if not keyword :
        keyword = ""
    if len(keyword)>0:
        expectations = Professor.objects.filter(Q(professor_name__icontains=keyword)|Q(professor_name_en__icontains=keyword))
        expectations = [{"name":i.professor_name,"id":i.id} for i in expectations]
    else:
        expectations = []

    context = {
            "expectations":expectations,
    }

    return JsonResponse(context,safe=False)


def resultCourse(request, page):
    #body = json.loads(request.body.decode('utf-8'))
    keyword = request.GET.get('q')
    if not keyword :
        keyword = ""
    semester_filters = request.GET.getlist('semester')
    department_filters = _departmentFilters(request.GET.getlist('department'))
    type_filters = _typeFilters(request.GET.getlist('type'))
    grade_filters = _gradeFilters(request.GET.getlist('grade'))
    print('hihi', semester_filters)
    sort = request.GET.get('sort')

    #semester_filters = body['semester']
    #department_filters = _departmentFilters(body['department'])
    #type_filters = _typeFilters(body['type'])
    #grade_filters = _gradeFilters(body['grade'])

    courses = _getFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)

    if sort :
        if sort=='name':
            courses = courses.order_by('title','old_code')
        elif sort=='total':
            courses = courses.order_by('-total','old_code')
        elif sort=='grade':
            courses = courses.order_by('-grade','old_code')
        elif sort=='load':
            courses = courses.order_by('-load','old_code')
        elif sort=='speech':
            courses = courses.order_by('-speech','old_code')
        else:
            courses = courses.order_by('old_code')
    else :
        courses = courses.order_by('old_code')

    paginator = Paginator(courses,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404

    results = [i.toJson(user=request.user) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
            "keyword":keyword,
    }
    return JsonResponse(context,safe=False)


def professor(request,id=-1,course_id=-1):
    professor = Professor.objects.get(id=id)
    context = {
            "result": professor.toJson(),
    }
    return JsonResponse(context,safe=False)


def professorComment(request, id=-1,course_id=-1,page=-1):
    comments = Comment.objects.filter(lecture__professors__id=id).order_by('-lecture__year','-written_datetime')
    if int(course_id) != -1:
        comments = comments.filter(lecture__course__id=course_id)
    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = [i.toJson(user=request.user) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(context,safe=False)


def course(request,id=-1,professor_id=-1):
    professor_id = int(professor_id)
    course = Course.objects.get(id=id)

    context = {
            "result": course.toJson(user=request.user),
    }
    return JsonResponse(context,safe=False)


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
            user_profile = UserProfile.objects.get(user=user)
            target_review = Comment.objects.get(id=body['commentid'])
            if CommentVote.objects.filter(comment = target_review, userprofile = user_profile).exists():
                already_up = True
            else:
                CommentVote.cv_create(target_review,user_profile) #session 완성시 변경
            likes_count = target_review.like
    ctx = {'likes_count': likes_count, 'already_up': already_up, 'is_login':is_login, 'id': body['commentid']}
    return JsonResponse(ctx,safe=False)

#course읽었을 때 호출되는 함수입니다. 아마도 courseComment 함수 안에 추가되어야 할듯 합니다.
@login_required(login_url='/session/login/')
def read_course(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    body = json.loads(request.body.decode('utf-8'))
    course_id = int(body['id'])
    course = Course.objects.get(id=course_id)
    try:
        course_user = CourseUser.objects.get(user_profile=user_profile, course=course)
        course_user.save()
    except CourseUser.DoesNotExist:
        CourseUser.objects.create(user_profile=user_profile, course=course)
    return JsonResponse({}, safe=False)

@login_required(login_url='/session/login/')
def insert(request):
    print("insert")
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    print(user_profile)

    # TODO : Change here
    if user_profile.portal_check == 1:
        user_profile.portal_check =0
        user_profile.save()
        return HttpResponseRedirect('/session/logout/')

    if len(user_profile.student_id) < 1:
        raise Http404 # TODO : Change this to return 401

    result = []
    for l in user_profile.take_lecture_list.all():
        result.append({
            "title" : l.title,
            "id" : l.id,
            "year" : l.year,
            "semester" : l.semester,
            "old_code" : l.old_code,
            "professor" : [{"professor_name":p.professor_name} for p in l.professors.all()],
        })

    return JsonResponse(result, safe=False)


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
    user_profile = UserProfile.objects.get(user=user)

    lecid = int(lecture_id)
    lecture = user_profile.take_lecture_list.get(id = lecid) # 하나로 특정되지않음, 변경요망
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
        target_comment = user_profile.comment_set.get(lecture=lecture)
        if target_comment.is_deleted == 0: target_comment.u_update(grade=grade, load=load, speech=speech, comment=comment)
    except Comment.DoesNotExist :
        target_comment = Comment.u_create(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, writer=writer)
    return JsonResponse({"id":target_comment.id}, safe=False)


def ReviewView(request, comment_id):
    try :
        comment = Comment.objects.get(id=comment_id).toJson(user=request.user)
    except Comment.DoesNotExist:
        raise Http404

    return JsonResponse(comment,safe=False)


def latest(request, page=-1):
    filter = request.GET.get('filter')
    if filter == 'F':
        if request.user.is_authenticated():
            user_profile = UserProfile.objects.get(user=request.user)
            favorite_departments_code = []
            for department in user_profile.favorite_departments.all():
                favorite_departments_code.append(department.code)
            department_filters = _departmentFilters(favorite_departments_code)
        else:
            department_filters = []
    else:
        department_filters = _departmentFilters([filter])
    comments = Comment.objects.filter(course__department__code__in=department_filters).order_by('-written_datetime')

    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = [i.toJson(user=request.user) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
            "is_login":request.user.is_authenticated(),
    }
    return JsonResponse(context,safe=False)


def dictionary(request, course_code):
    courses = Course.objects.filter(old_code = str(course_code))
    if len(courses)>0:
        return HttpResponseRedirect('/review/result/course/'+str(courses[0].id))
    raise Http404



