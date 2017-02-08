# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.timetable.models import TimeTable
from django.contrib.auth.models import User
from apps.subject.models import Lecture, ClassTime, ExamTime
from django.http.response import HttpResponseNotAllowed, HttpResponseBadRequest
from django.http import JsonResponse

# Django modules
from django.core.exceptions import *
from django.http import *
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.conf import settings
from django.shortcuts import render
from django.forms.models import model_to_dict

# For google calender
from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools
from oauth2client.client import OAuth2WebServerFlow
import datetime
import httplib2
# Misc
import os
import json


def test(request):
    context = {'pagetTitle': 'JADE 사용', 'youAreUsingJade': True}
    return render(request, 'test.jade', context)


def main(request):
    return render(request, 'timetable/index.html')


def show_table(request):
    seasons = ['봄', '여름', '가을', '겨울']
    u1 = User.objects.filter(username='ashe')[0]
    up1 = UserProfile.objects.filter(user=u1)[0]
    t1 = TimeTable.objects.filter(user=up1)[0]

    lecture_list = list(t1.lecture.all())
    table_of = u1.username
    year = t1.year
    season = seasons[t1.semester-1]
    table_id = t1.table_id
    table_name = "시간표 " + str(table_id+1)

    context = {
        "lecture_list": lecture_list,
        "table_of": table_of,
        "year": year,
        "season": season,
        "table_name": table_name,
    }
    return render(request, 'timetable/show.html', context)

def update_table(request):
    if request.method == 'GET':
        return render(request, 'timetable/update_table.html')
        

def update_my_lectures(request):
    ''' Add/delete lecture to users lecture list
    '''
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        raise ValidationError('no user profile')

    if 'table_id' not in request.POST or 'code' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])
    code = request.POST['code']

    # Find the right timetable
    timetables = list(TimeTable.objects.filter(user=userprofile, table_id=table_id))
    # Find the right lecture
    lecture = Lecture.objects.filter(code=code)

    if len(lecture) == 0:
        return JsonResponse({ 'success': False, 'reason': 'No matching lecture found' });

    if len(timetables) == 0:
        # Create new timetable if no timetable exists
        t = TimeTable(user=userprofile, year=2017, semester=1, table_id=table_id)
        t.save()
    else:
        t = timetables[0]

    t.lecture.add(lecture[0])
    return JsonResponse({ 'success': True });


def show_my_lectures(request):
    ''' Returns all the lectures the user is listening
    '''
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        raise ValidationError('no user profile')

    timetables = list(TimeTable.objects.filter(user=userprofile))

    ctx = {
        'timetables': [],
    }

    for i, t in enumerate(timetables):
        timetable = model_to_dict(t, exclude='lecture')
        lects = []
        for l in t.lecture.all():
            lects.append(model_to_dict(l))
        ctx['timetables'].append(timetable)
        ctx['timetables'][i]['lecture'] = lects
        

    return JsonResponse(ctx, safe=False, json_dumps_params= \
                        { 'ensure_ascii': False })


@login_required_ajax
def calendar(request):
    """Exports otl timetable to google calender
    """
    user = request.user
    try:
        userprofile = UserProfile.objects.get(user=user)
    except:
        raise ValidationError('no user profile')

    email = user.email
    if email is None:
        return JsonResponse({'result': 'EMPTY'},
                            json_dumps_params={'ensure_ascii': False, 'indent': 4})


    with open(os.path.join(settings.BASE_DIR), 'keys/client_secrets.json') as f:
        data = json.load(f.read())
        client_id = data['installed']['client_id']
        client_secret = data['installed']['client_secret']
        api_key = data['api_key']

    FLOW = OAuth2WebServerFlow(
        client_id=client_id,
        client_secret=client_secret,
        scope='https://www.googleapis.com/auth/calendar',
        user_agent='')

    store = oauth2client.file.Storage(path)
    credentials = store.get()
    if credentials is None or credentials.invalid:
        credentials = tools.run_flow(FLOW, store)

    http = credentials.authorize(httplib2.Http())
    service = discovery.build(serviceName='calender', version='v3', http=http, developerKey='blah')

    calendar_name = "[OTL]" + str(user) + "'s calendar"
    calendar = None

    if userprofile.calendar_id is not None:
        try:
            calendar = service.calendars().get(calendarId = userprofile.calendar_id).execute()
            if calendar is not None and calendar['summary'] != calendar_name:
                calendar['summary'] = calendar_name
                calendar = service.calendars().update(calendarId = calendar['id'], body = calendar).execute()
        except:
            pass

   #if calendar == None:
       # Make a new calender

   # TODO: Add calendar entry
