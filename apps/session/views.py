from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from apps.subject.models import Department
from apps.session.models import UserProfile
import urllib
import json
import random

# Create your views here.

def home(request):
    return HttpResponse("session!")

def user_login(request):
    user = request.user
    if user is not None and user.is_authenticated():
        redirect('/')
    return redirect('https://sso.sparcs.org/oauth/require/?url=' + \
                     request.build_absolute_uri('/session/login/callback/')) 
def login_callback(request):
    if request.method == "GET":
        nexturl = request.GET.get('next', '/')
        uid = request.GET['uid']
        sso_profile = urllib.urlopen('https://sso.sparcs.org/' + \
                'oauth/info?uid='+uid)
        sso_profile = json.load(sso_profile)
        username = sso_profile['username']
        user_list = User.objects.filter(username=username)
        if len(user_list) == 0:
            user = User.objects.create_user(username=sso_profile['username'],
                        email=sso_profile['email'],
                        password=str(random.getrandbits(32)),
                        first_name=sso_profile['first_name'],
                        last_name=sso_profile['last_name']) 
            user.save()
            user_profile = UserProfile(user=user)
            user_profile.save()
            return redirect(nexturl)
        else:
           user = authenticate(username = user_list[0].username) 
           login(request, user)
           return redirect(nexturl)
    return render('/session/login.html', {'error': "Invalid login"})

def logout(request):
    if request.user.is_authenticated():
        logout(request)
    return redirect("/session/login")

@login_required(login_url='/session/login/')
def settings(request):
    #user = request.user
    #user_profile = UserProfile.objects.get(user = user)
    if request.method == 'POST':
        language = request.POST['language']
        return render(request, 'session/settings.html', {'errors': "hi"})
    department = Department.objects.all() 
    return render(request, 'session/settings.html',
            {'department': department,
             'usr_lang': 'ko'})



