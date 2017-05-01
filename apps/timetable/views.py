# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
# from apps.timetable.models import TimeTable
from apps.subject.models import Lecture, Professor, Course
from apps.review.models import Comment
from django.contrib.auth.models import User
from apps.subject.models import Lecture
# from apps.subject.models import ClassTime, ExamTime
from django.http.response import HttpResponseNotAllowed, HttpResponseBadRequest
from django.http import JsonResponse

# Django modules
from django.db.models import Q
from django.core import serializers
from django.forms.models import model_to_dict
from django.core.exceptions import *
from django.http import *
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.conf import settings
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.db.models import Max

# For google calender
from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.contrib import xsrfutil
from oauth2client.contrib.django_util.storage import DjangoORMStorage

import datetime
import httplib2
# Misc
import os
import json


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
        year, semester = _year_semester()
        ctx = { 'year': year, 'semester': semester }
        return render(request, 'timetable/update_table.html', ctx)


def _year_semester():
    '''Get current year and semester.

       If lectures are updated, we can get latest year and semester
       from its year and semester fields. Its quite naaive way of determining, so
       if models aren't updated we can't get current year and semester info
    '''
    year = Lecture.objects.aggregate(Max('year'))['year__max']
    semester = Lecture.objects.filter(year=year) \
                              .aggregate(Max('semester'))['semester__max']
    return (year, semester)


def update_my_lectures(request):
    '''Add/delete lecture to users lecture list.
    '''
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        raise ValidationError('no user profile')

    if 'table_id' not in request.POST or 'code' not in request.POST or \
       'year' not in request.POST or 'semester' not in request.POST or \
       'delete' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])
    year = int(request.POST['year'])
    semester = int(request.POST['semester'])
    code = request.POST['code']
    delete = request.POST['delete'] == u'true'

    # Find the right timetable
    timetables = list(TimeTable.objects.filter(user=userprofile, table_id=table_id,
                                               year=year, semester=semester))
    # Find the right lecture
    lecture = Lecture.objects.filter(code=code)

    if len(lecture) == 0:
        return JsonResponse({ 'success': False, 'reason': 'No matching lecture found' });

    if len(timetables) == 0:
        # Create new timetable if no timetable exists
        t = TimeTable(user=userprofile, year=year, semester=semester, table_id=table_id)
        t.save()
    else:
        t = timetables[0]

    if not delete:
        t.lecture.add(lecture[0])
    else:
        t.lecture.remove(lecture[0])

    return JsonResponse({ 'success': True });


def copy_my_timetable(request):
    '''Copy the contents of user timetable'''
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.object.get(user=request.user)
    except:
        raise validationerror('no user profile')

    if 'table_to' not in request.POST or 'table_from' not in request.POST or \
       'year' not in request.POST or 'semester' not in request.POST:
        return HttpResponseBadRequest()

    table_from = int(request.POST['table_from'])
    table_to = int(request.POST['table_to'])
    year = int(request.POST['year'])
    semester = int(request.POST['semester'])

    # Find the right timetable
    tables_from = list(TimeTable.objects.filter(user=userprofile, table_id=table_from,
                                               year=year, semester=semester))
    if len(tables_from) == 0:
        return JsonResponse({ 'success': False, 'reason': 'No matching table found' })

    # Check if dst exists, if exists delete and copy else, just make an copy
    tables_to = list(TimeTable.objects.filter(user=userprofile, table_id=table_to,
                                              year=year, semester=semester))
    if len(tables_to) != 0:
        tablles_to[0].delete()

    table = tables_to[0]
    table.pk = None
    table.table_id = table_to
    table.save()

    return JsonResponse({ 'success': True })


def delete_my_timetable(request):
    '''Deletes(clears) user timetable '''
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.object.get(user=request.user)
    except:
        raise validationerror('no user profile')

    if 'table_id' not in request.POST or 'yearr' not in request.POST or \
       'semester' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])

    tables = list(TimeTable.objects.filter(user=userprofile, table_id=table_id,
                                           year=year, semester=semester))
    if len(tables) == 0:
        return JsonResponse({ 'success': False, 'reason': 'No such timetable exist' })

    tables[0].delete()
    return JsonResponse({ 'scucess': True })


def show_my_lectures(request):
    '''Returns all the lectures the user is listening'''
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

def show_lecture_comments(request):
    '''Returns comment of selected lecture'''
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    code = request.POST['code']
    comments = Comment.objects.filter(code = code)

def search_temp(request):
    return render(request, 'timetable/search_temp.html')


def search_temp_ajax(request):
    if request.method == 'POST':
        keyword = request.POST['keyword']
        # year = request.POST['year']
        # semester = request.POST['semester']
        year = 2016
        semester = 3
        lecture_at_that_time = Lecture.objects.filter(year=year).filter(semester=semester)
        result_from_lecture = lecture_at_that_time.filter(
                Q(title__icontains=keyword) |
                Q(title_en__icontains=keyword) |
                Q(old_code__icontains=keyword)
            )
        result_from_lecture = list(result_from_lecture)
        professors = Professor.objects.filter(
                Q(professor_name__icontains=keyword) |
                Q(professor_name_en__icontains=keyword)
            )
        professors = list(professors)
        result_from_professor = list()
        for lec in lecture_at_that_time:
            lec_professor = list(lec.professor.all())
            for prof in professors:
                if prof in lec_professor:
                    result_from_professor.append(lec)
                    continue
        result_lectures = result_from_lecture + result_from_professor
        # result_lectures_and_times = []
        # for res_lec in result_lectures:
        #     result_lectures_and_times.append({
        #         'lecture': model_to_dict(res_lec),
        #         'classtime': res_lec.examtime_set.all(),
        #         'examtime': res_lec.classtime_set.all()
        #     })
        # for i in range(len(result)):
        #     result[i]['classtime'] = result[i].classtime_set.all()
        #     result[i]['examtime'] = result[i].classtime_set.all()
        json_result = serializers.serialize('json', result_lectures)
        # json_result = json.dumps(result_lectures_and_times)
        print json_result
        return HttpResponse(json_result, content_type="application/json")


def fetch_temp(request):
    return render(request, 'timetable/fetch_temp.html')


def fetch_temp_ajax(request):
    if request.method == 'POST':
        lecture_name = request.POST['lecture_name']
        professor_id = request.POST['professor_id']
        year = 2015
        semester = 3
        professor = Professor.objects.get(professor_id=professor_id)
        print professor
        lecture_candidate = Lecture.objects.filter(year=year).filter(semester=semester)\
            .filter(title__icontains=lecture_name)
        lectures = list()
        print lecture_candidate
        for candidate in lecture_candidate:
            if professor in candidate.professor.all():
                lectures.append(candidate)
        lecture = lectures[0]
        # print lecture
        comments = Comment.objects.filter(lecture=lecture)
        # print comments
        json_result = serializers.serialize('json', comments)
        return HttpResponse(json_result, content_type="application/json")


def search_keyword(request):
    if request.method == 'POST':
        print request.POST;
        return JsonResponse({'success': True})

FLOW = client.flow_from_clientsecrets(settings.GOOGLE_OAUTH2_CLIENT_SECRETS_JSON,
                                      scope='https://www.googleapis.com/auth/calendar')

@login_required_ajax
def calendar(request):
    """Exports otl timetable to google calender
    """
    user = request.user
    try:
        userprofile = UserProfile.objects.get(user=user)
    except:
        return HttpResponseServerError("userprofile not found")

    if reqeust.method != POST:
        return HttpResposneNotAllowed()

    if table_id not in request.POST or year not in request.POST or \
       semester not in request.POST:
        return HttpResponseBadRequest()

    semester = request.POST['table_id']
    year = request.POST['year']
    semester = reuqest.POST['semester']

    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    credential = storage.get()

    if credential is None or credential.invalid == True:
        FLOW.params['state'] = xsrfutil.generate_token(settings.SECRET_KEY,
                                                       request.user)
        authorize_url = FLOW.step1_get_authorize_url()
        return HttpResponseRedirect(authorize_url)

    http = credential.authorize(httplib2.Http())
    service = discovery.build('calender', 'v3', http=http)

    calendar_name = "[OTL]" + str(user) + "'s calendar"
    calendar = None

    # Get calender for otlplus
    if userprofile.calendar_id is not None:
        try:
            calendar = service.calendars().get(calendarId=userprofile.calendar_id).execute()
            if calendar is not None and calendar['summary'] != calendar_name:
                calendar['summary'] = calendar_name
                calendar = service.calendars().update(calendarId=calendar['id'], body=calendar).execute()
        except:
            print "fuct"
    # Create new calender
    else:
        calendar = {
            'summary': calendar_name,
            'timeZone': 'Asia/Seoul'
        }

        created_calendar = service.calendars().insert(body=calendar).execute()
        c_id = created_calendar['id']
        userprofile.calender_id = created_calender['id']
        userprofile.save()

        # Customize Calendars
        calendar_list = service.calendarList().get(calendarId=c_id).execute()
        calendar_list['backgroundColor'] = '#004191'  # Kaist Dark Blue
        calendar_list['defaultReminders'] = [{
            'method': 'popup',
            'minutes': 10
        }]
        service.calendarList().update(calendarId=c_id).execute()

        userprofile.calender_id = c_id
        userprofile.save()

    # Add calendar event
    if calendar is None:
        return HttpResponseServerError()
    else:
        # Find the right timetable
        try:
            timetable = TimeTable.objects.get(user=userprofile, table_id=table_id,
                                                   year=year, semester=semester)
            start = settings.SEMESTER_RANGES[(year,semester)][0]
            end = settings.SEMESTER_RANGES[(year,semester)][1] + timedelta(days=1)
        except:
            return HttpResponseBadRequest()

        for lecture in timetable.lecture.all():
            for classtime in ClassTime.objects.filter(lecture=lecture):
                days_ahead = classtime.day - start.weekday()
                if days_ahead < 0:
                    days_ahead += 7
                class_date = start + timedelta(days=days_ahead)

                event = {
                    'summary': _trans(lecture.title, lecture.title_en, lang),
                    'location': _trans(classtime.room_ko, classtime.room_en, lang) + " " + (classtime.room or ''),
                    'start': {
                        'dateTime' : datetime.combine(class_date, classtime.begin).isoformat(),
                        'timeZone' : 'Asia/Seoul'
                        },
                    'end': {
                        'dateTime' : atetime.combine(class_date, classtime.end).isoformat(),
                        'timeZone' : 'Asia/Seoul'
                        },
                    'recurrence' : ['RRULE:FREQ=WEEKLY;UNTIL=' + end.strftime("%Y%m%d")]
                }

                service.events().insert(calendar_id=c_id, body=event).execute()

    return JsonResponse({'result': 'OK'})



def _trans(ko_message, en_message, lang):
    if en_message == None or lang == 'ko':
        return ko_message
    else:
        return en_message

@login_required
def google_auth_return(request):
    if not xsrfutil.validate_token(settings.SECRET_KEY, request.REQUEST['state'],
                                   request.user):
        return HttpResponseBadRequest()
    credential = FLOW.step2_exchange(request.REQUEST)
    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    storage.put(credential)
    return HttpResponseRedirect("/")
