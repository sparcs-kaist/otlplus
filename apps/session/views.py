from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.conf import settings
from apps.subject.models import Department
from apps.session.models import UserProfile
import urllib
import json
import random

# Create your views here.

def home(request):
    return render(request, './session/session.html')

def user_login(request):
    user = request.user
    if user is not None and user.is_authenticated():
        next = request.session.get('next', '/')
        redirect(next)
    request.session['next'] = request.GET.get('next', '/')
    return render(request, './session/login.html',
        {'login_url': 'https://sparcssso.kaist.ac.kr/oauth/require/?url=' + \
                     request.build_absolute_uri('/session/login/callback/')})

def login_callback(request):
    if request.method == "GET":
        try:
            next = request.session.get('next', '/')
            del request.session['next']
        except KeyError:
            pass
        tokenid = request.GET['tokenid']
        sso_profile = urllib.urlopen('https://sparcssso.kaist.ac.kr/' + \
                                     'oauth/info?tokenid='+tokenid)
        sso_profile = json.load(sso_profile)
        username = sso_profile['sid']
        user_list = User.objects.filter(username=username)
        if len(user_list) == 0:
            user = User.objects.create_user(username=username,
                        email=sso_profile['email'],
                        password=str(random.getrandbits(32)),
                        first_name=sso_profile['first_name'],
                        last_name=sso_profile['last_name'])
            user.save()
            user_profile = UserProfile(user=user)
            user_profile.sid = sso_profile['sid']
            user_profile.save()
            return redirect(next)
        else:
           user = authenticate(username=user_list[0].username)
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
    user_profile = UserProfile.objects.get(user = user)
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
    return redirect("https://sparcssso.kaist.ac.kr/oauth/service/")

def unregister_callback(request):
    sid = request.GET['sid']
    key = request.GET['key']
    if key != settings.SSO_KEY:
        return JsonResponse({"status": 1})
    user_profile = UserProfile.objects.get(sid=sid)
    if user_profile is None:
        return JsonResponse({"status": 1})
    user_profile.user.delete()
    user_profile.delete()
    return JsonResponse({"status": 0})
