from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.conf import settings
from apps.subject.models import Department
from apps.session.models import UserProfile
from apps.session.sparcssso import Client
import urllib
import json
import random


# TESTING #
sso_client = Client(is_test=True)

# PRODUCTION #
# sso_client = Client(is_test=False,
#                     app_name='otlplus',
#                     secret_key=settings.SSO_KEY)


def home(request):
    return HttpResponseRedirect('./login/')


def user_login(request):
    user = request.user
    if user and user.is_authenticated():
        return redirect(request.GET.get('next', '/'))

    request.session['next'] = request.GET.get('next', '/')

    callback_url = request.build_absolute_uri('/session/login/callback/')
    login_url = sso_client.get_login_url(callback_url)
    # return render(request, './session/login.html', {'login_url': login_url})
    return HttpResponseRedirect(login_url)


def login_callback(request):
    if request.method == "GET":
        next = request.session.pop('next', '/')
        tokenid = request.GET.get('tokenid', '')

        sso_profile = sso_client.get_user_info(tokenid)
        username = sso_profile['sid']

        user_list = User.objects.filter(username=username)
        try:
            kaist_info = json.loads(sso_profile['kaist_info'])
            student_id = kaist_info.get('ku_std_no')
        except:
            student_id = ''
        if len(user_list) == 0:
            user = User.objects.create_user(username=username,
                        email=sso_profile['email'],
                        password=str(random.getrandbits(32)),
                        first_name=sso_profile['first_name'],
                        last_name=sso_profile['last_name'])
            user.save()
            user_profile = UserProfile(user=user, student_id=student_id)
            user_profile.sid = sso_profile['sid']
            user_profile.save()
            user = authenticate(username=username)
            login(request, user)
            return redirect(next)
        else:
           user = authenticate(username=user_list[0].username)
           user_profile = UserProfile.objects.get(user=user)
           user_profile.student_id = student_id
           login(request, user)
           return redirect(next)
    return render('/session/login.html', {'error': "Invalid login"})


def user_logout(request):
    if request.user.is_authenticated():
        logout(request)
    return redirect("/main")


@login_required(login_url='/session/login/')
def settings(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    department = Department.objects.all()
    fav_department = user_profile.favorite_departments.all()
    ctx = { 'department': department,
            'fav_department': fav_department,
            'usr_lang': user_profile.language}
    if request.method == 'POST':
        user_profile.language = request.POST['language']
        for dpt_name in request.POST.get('fav_department', []):
            dpt = Department.objects.get(name=dpt_name)
            user_profile.favorite_departments.add(dpt)
        user_profile.save()
        ctx['fav_department'] = user_profile.favorite_departments
        ctx['usr_lang'] = user_profile.language
        return render(request, 'session/settings.html', ctx)
    return render(request, 'session/settings.html', ctx)


@login_required(login_url='/session/login/')
def unregister(request):
    return redirect("https://sparcssso.kaist.ac.kr/account/service/")


def unregister_callback(request):
    sid = request.GET['sid']
    key = request.GET['key']
    if key != settings.SSO_KEY:
        return JsonResponse({"status": 1})

    user = User.objects.filter(username=sid).first()
    if not user:
        return JsonResponse({"status": 1})

    user.profile.delete()
    user.delete()

    return JsonResponse({"status": 0})
