from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.conf import settings
from apps.subject.models import Department, Lecture
from apps.review.models import Review
from apps.timetable.models import OldTimetable
from apps.timetable.views import _user_department
from .models import UserProfile
from .sparcssso import Client
from utils.decorators import login_required_ajax
import json
import random
import os
import datetime
from django.db.models import Q
from django.conf import settings


sso_client = Client(settings.SSO_CLIENT_ID, settings.SSO_SECRET_KEY, is_beta=settings.SSO_IS_BETA)

def home(request):
    return HttpResponseRedirect('./login/')


def user_login(request):
    user = request.user
    if user is None or not user.is_authenticated:
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
        return HttpResponseRedirect('/error/invalid-login')

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
        os.system('python do_import_taken_lecture_user.py %s' % student_id)
        OldTimetable.import_in_for_user(student_id)

        user = authenticate(request, username=username)
        login(request, user)
        return redirect(next)
    else:
        user = authenticate(request, username=user_list[0].username)
        user.first_name=sso_profile['first_name']
        user.last_name=sso_profile['last_name']
        user.save()
        user_profile = user.userprofile
        previous_student_id = user_profile.student_id
        user_profile.student_id = student_id
        user_profile.save()
        if previous_student_id != student_id:
            if not settings.DEBUG:
                os.chdir('/var/www/otlplus/')
            os.system('python do_import_user_major.py %s' % student_id)
            os.system('python do_import_taken_lecture_user.py %s' % student_id)
            OldTimetable.import_in_for_user(student_id)
        login(request, user)
        return redirect(next)


def user_logout(request):
    if request.user.is_authenticated:
        sid = request.user.userprofile.sid
        redirect_url = request.GET.get('next', request.build_absolute_uri('/'))
        logout_url = sso_client.get_logout_url(sid, redirect_url)
        logout(request)
        request.session['visited'] = True
        return redirect(logout_url)
    return redirect("/")


def department_options(request):
    dept_under = ["CE", "MSB", "ME", "PH", "BiS",
                "IE", "ID", "BS", "CBE", "MAS",
                "MS", "NQE", "HSS", "EE", "CS",
                "AE", "CH"]
    dept_exclude = ["AA", "KSA", "URP", "ED", "INT",
                    "KJ", "CWENA", "C", "E", "S",
                    "PSY", "SK", "BIO", "CLT", "PHYS"]

    department_1 = []
    department_2 = []
    department_3 = []
    year_threshold = datetime.datetime.now().year - 2
    recent_lectures = Lecture.objects.filter(year__gte=year_threshold)
    for d in Department.objects.filter(visible=True).exclude(code__in=dept_exclude).order_by('name'):
        if d.code in dept_under:
            department_1.append(d)
        elif (recent_lectures.filter(department__code=d.code).exists()):
            department_2.append(d)
        else:
            department_3.append(d)

    result = [
        [d.toJson() for d in department_1],
        [d.toJson() for d in department_2],
        [d.toJson() for d in department_3],
    ]

    return JsonResponse(result, safe=False)




@login_required_ajax
def favorite_departments(request):
    user = request.user
    user_profile = user.userprofile
    body = json.loads(request.body.decode('utf-8'))

    if request.method == 'POST':
        favorite_departments = []

        fav_department = body.get('fav_department', [])

        for di in fav_department:
            dpt = Department.objects.get(id=di)
            user_profile.favorite_departments.add(dpt)

        for d in user_profile.favorite_departments.all():
            if str(d.id) not in fav_department:
               user_profile.favorite_departments.remove(d)

        user_profile.save()
        return HttpResponse()

    return HttpResponseBadRequest


@login_required(login_url='/session/login/')
def unregister(request):
    if request.method != 'POST':
        return HttpResponseRedirect('/error/problem-unregister')

    user = request.user
    user_profile = user.userprofile

    sid = user_profile.sid
    result = sso_client.do_unregister(sid)
    if not result:
        return HttpResponseRedirect('/error/problem-unregister')

    user_profile.delete()
    user.delete()
    logout(request)

    return JsonResponse(status=200, data={})


@login_required_ajax
def info(request):
    userProfile = request.user.userprofile
    ctx = {
        "id": userProfile.id,
        "email": userProfile.user.email,
        "student_id": userProfile.student_id,
        "firstName": request.user.first_name,
        "lastName": request.user.last_name,
        "majors": [d.toJson() for d in ( ([userProfile.department] if (userProfile.department != None) else []) + list(userProfile.majors.all()) + list(userProfile.minors.all()) )],
        "departments": _user_department(request.user),
        "favorite_departments": [d.toJson() for d in userProfile.favorite_departments.all()],
        "review_writable_lectures": [l.toJson() for l in userProfile.getReviewWritableLectureList()],
        "my_timetable_lectures": [l.toJson() for l in userProfile.taken_lectures.exclude(Lecture.getQueryResearch())],
        "reviews": [r.toJson(nested=True) for r in userProfile.reviews.all()],
    }
    return JsonResponse(ctx, safe = False)

