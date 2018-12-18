from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.utils import translation
from apps.subject.models import Department, Lecture
from apps.review.models import Comment
from apps.timetable.models import OldTimeTable
from apps.session.models import UserProfile
from apps.session.sparcssso import Client
import urllib
import json
import random
import os
import datetime
import subprocess
from django.db.models import Q
from django.conf import settings

import urlparse
import requests
from django.db.models import Q

sso_client = Client(settings.SSO_CLIENT_ID, settings.SSO_SECRET_KEY, is_beta=settings.SSO_IS_BETA)

def home(request):
    return HttpResponseRedirect('./login/')


def user_login(request):
    user = request.user
    if user and user.is_authenticated():
        return redirect(request.GET.get('next', '/'))

    request.session['next'] = request.GET.get('next', '/')

    login_url, state = sso_client.get_login_params()
    request.session['sso_state'] = state

    return HttpResponseRedirect(login_url)


@require_http_methods(['GET'])
def login_callback(request):
    next = request.session.pop('next', '/')
    state_before = request.session.get('sso_state', 'default before state')
    state = request.GET.get('state', 'default state')

    if state_before != state:
        return render(request, 'session/login_error.html',
                      {'error_title': "Login Error",
                       'error_message': "Invalid login"})

    code = request.GET.get('code')
    sso_profile = sso_client.get_user_info(code)
    username = sso_profile['sid']

    user_list = User.objects.filter(username=username)
    try:
        kaist_info = json.loads(sso_profile['kaist_info'])
        student_id = kaist_info.get('ku_std_no')
    except:
        student_id = ''

    if student_id is None:
        student_id= ''

    if len(user_list) == 0:
        user = User.objects.create_user(username=username,
                    email=sso_profile['email'],
                    password=str(random.getrandbits(32)),
                    first_name=sso_profile['first_name'],
                    last_name=sso_profile['last_name'])
        user.save()

        try:
            user_profile = UserProfile.objects.get(student_id=sso_profile['sid'])
            user_profile.user = user
        except:
            user_profile = UserProfile(student_id=student_id, user = user)

        user_profile.sid = sso_profile['sid']
        user_profile.save()

        if not settings.DEBUG:
            os.chdir('/var/www/otlplus/')
        os.system('python do_import_user_major.py %s' % student_id)
        os.system('python update_taken_lecture_user.py %s' % student_id)
        OldTimeTable.import_in_for_user(student_id)

        user = authenticate(username=username)
        login(request, user)
        return redirect(next)
    else:
        user = authenticate(username=user_list[0].username)
        user.first_name=sso_profile['first_name']
        user.last_name=sso_profile['last_name']
        user.save()
        user_profile = UserProfile.objects.get(user=user)
        previous_student_id = user_profile.student_id
        user_profile.student_id = student_id
        user_profile.save()
        if previous_student_id != student_id:
            if not settings.DEBUG:
                os.chdir('/var/www/otlplus/')
            os.system('python do_import_user_major.py %s' % student_id)
            os.system('python update_taken_lecture_user.py %s' % student_id)
            OldTimeTable.import_in_for_user(student_id)
        login(request, user)
        return redirect(next)
    return render(request, 'session/login_error.html',
                  {'error_title': "Login Error",
                   'error_message': "No such that user"})


def user_logout(request):
    if request.user.is_authenticated():
        sid = UserProfile.objects.get(user=request.user).sid
        redirect_url = request.GET.get('next', request.build_absolute_uri('/'))
        logout_url = sso_client.get_logout_url(sid, redirect_url)
        logout(request)
        request.session['visited'] = True
        return redirect(logout_url)
    return redirect("/main")


@login_required(login_url='/session/login/')
def user_settings(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)

    dept_under = ["CE", "MSB", "ME", "PH", "BiS",
                  "IE", "ID", "BS", "CBE", "MAS",
                  "MS", "NQE", "HSS", "EE", "CS",
                  "AE", "CH"]
    dept_exclude = ["AA", "KSA", "URP", "ED", "INT",
                    "KJ", "CWENA", "C", "E", "S",
                    "PSY", "SK", "BIO", "CLT", "PHYS"]

    department_1 = Department.objects.filter(code__in=dept_under, visible=True).order_by('name')
    department_others = Department.objects.filter(visible=True).exclude(code__in=dept_under+dept_exclude).order_by('name')
    department_2 = []
    department_3 = []
    current_lectures = Lecture.objects.filter(year=settings.CURRENT_YEAR, semester=settings.CURRENT_SEMESTER)
    for d in department_others:
        if (current_lectures.filter(department__code=d.code).exists()):
            department_2.append(d)
        else:
            department_3.append(d)

    fav_department = user_profile.favorite_departments.all()

    if len(user_profile.language) == 0:
        user_profile.language = 'ko'
        user_profile.save()

    ctx = { 'department_1': department_1,
            'department_2': department_2,
            'department_3': department_3,
            'fav_department': fav_department,
            'usr_lang': user_profile.language}

    if request.method == 'POST':

        user_profile.language = request.POST['language']

        favorite_departments = []
        for dpt_id in request.POST.getlist('fav_department', []):
            dpt = Department.objects.get(id=dpt_id)
            user_profile.favorite_departments.add(dpt)
        for dpt in user_profile.favorite_departments.all():
            favorite_departments.append(dpt)
            if str(dpt.id) not in request.POST.getlist('fav_department', []):
               user_profile.favorite_departments.remove(dpt)

        user_profile.save()

        ctx['fav_department'] = favorite_departments
        ctx['usr_lang'] = user_profile.language
        return HttpResponseRedirect('/main/')

    return render(request, 'session/settings.html', ctx)


@login_required(login_url='/session/login/')
def unregister(request):
    if request.method != 'POST':
        return render(request, 'session/login_error.html',
                      {'error_title': "Unregister Error",
                       'error_message': "please try again"})

    user = request.user
    user_profile = UserProfile.objects.get(user=user)

    sid = user_profile.sid
    result = sso_client.do_unregister(sid)
    if not result:
        return render(request, 'session/login_error.html',
                      {'error_title': "Unregister Error",
                       'error_message': "please try again"})

    user_profile.delete()
    user.delete()
    logout(request)

    return JsonResponse(status=200, data={})


def language(request):
    if translation.LANGUAGE_SESSION_KEY not in request.session:
        to_lang = 'ko'
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        to_lang = 'en'
    else:
        to_lang = 'ko'

    request.session[translation.LANGUAGE_SESSION_KEY] = to_lang
    translation.activate(to_lang)

    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

