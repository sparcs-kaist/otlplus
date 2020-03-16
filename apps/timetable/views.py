# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.timetable.models import TimeTable, Wishlist
from apps.subject.models import Lecture, Professor, Course, Semester
from apps.review.models import Review
from apps.subject.models import *
from django.contrib.auth.models import User

# Django modules
from django.db.models import Q
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest, HttpResponseServerError, JsonResponse
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.views.decorators.http import require_POST
from django.conf import settings
from django.shortcuts import render, redirect
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.utils import translation
from django.core.cache import cache
from django.contrib.staticfiles.templatetags.staticfiles import static

# For google calendar
from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.contrib import xsrfutil
from oauth2client.contrib.django_util.storage import DjangoORMStorage

import datetime
import httplib2
import json
import urllib
import random

# Pillow
from PIL import Image, ImageDraw, ImageFont



def _user_department(user):
    if not user.is_authenticated():
        return [{'id': -1, 'code':'Basic', 'name':u' 기초 과목', 'name_en':u' Basic Course'}]

    u = user.userprofile

    if (u.department==None) or (u.department.code in ['AA', 'ICE']):
        departments = [{'id': -1, 'code':'Basic', 'name':u' 기초 과목', 'name_en':u' Basic Course'}]
    else:
        departments = [u.department.toJson()]

    for d in u.majors.all():
        data = d.toJson()
        if data not in departments:
            departments.append(data)

    for d in u.minors.all():
        data = d.toJson()
        if data not in departments:
            departments.append(data)

    for d in u.specialized_major.all():
        data = d.toJson()
        if data not in departments:
            departments.append(data)

    for d in u.favorite_departments.all():
        data = d.toJson()
        if data not in departments:
            departments.append(data)

    return departments



def _validate_year_semester(year, semester):
    return Semester.objects.filter(year=year, semester=semester).exists() \
        or (year, semester) in settings.SEMESTER_RANGES



# Add/Delete lecture to timetable
@require_POST
@login_required_ajax
def table_update(request):
    userprofile = request.user.userprofile

    body = json.loads(request.body.decode('utf-8'))
    try:
        table_id = int(body['table_id'])
        lecture_id = body['lecture_id']
        delete = body['delete'] == True
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    # Find the right timetable
    timetable = TimeTable.objects.get(user=userprofile, id=table_id)
    # Find the right lecture
    lecture = Lecture.objects.get(id=lecture_id, deleted=False)

    if timetable.year!=lecture.year or timetable.semester!=lecture.semester:
        return HttpResponseBadRequest('Semester not matching')

    if not delete:
        try:
            timetable.lecture.add(lecture)
        except IntegrityError:
            # Race condition when user sent multiple identical requests
            return JsonResponse({ 'success': False })
    else:
        timetable.lecture.remove(lecture)
        
    return JsonResponse({ 'success': True })



# Delete timetable
@require_POST
@login_required_ajax
def table_delete(request):
    userprofile = request.user.userprofile

    body = json.loads(request.body.decode('utf-8'))
    try:
        table_id = int(body['table_id'])
        year = int(body['year'])
        semester = int(body['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')
    
    target_table = TimeTable.objects.get(user=userprofile, id=table_id,
                                         year=year, semester=semester)
    target_table.delete()
    return JsonResponse({ 'scucess': True })



# Create timetable
@require_POST
@login_required_ajax
def table_create(request):
    userprofile = request.user.userprofile

    body = json.loads(request.body.decode('utf-8'))
    try:
        year = int(body['year'])
        semester = int(body['semester'])
        lecture_ids = body['lectures']
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    try:
        lectures = [Lecture.objects.get(id=i, year=year, semester=semester) for i in lecture_ids]
    except Lecture.DoexNotExist:
        return HttpResponseBadRequest('Lecture semester not matching')
    
    t = TimeTable(user=userprofile, year=year, semester=semester)
    t.save()
    for l in lectures:
        t.lecture.add(l)

    return JsonResponse({'scucess': True,
                         'id':t.id})



# Fetch timetable
@require_POST
@login_required_ajax
def table_load(request):
    userprofile = request.user.userprofile

    body = json.loads(request.body.decode('utf-8'))
    try:
        year = int(body['year'])
        semester = int(body['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    timetables = TimeTable.objects.filter(user=userprofile, year=year, semester=semester)

    if not timetables.exists():
        # Create new timetable if no timetable exists
        t = TimeTable(user=userprofile, year=year, semester=semester)
        t.save()
        timetables = [t]

    ctx = [{
        "id": t.id,
        "lectures":[l.toJson(nested=False) for l in t.lecture.filter(deleted=False)],
    } for t in timetables]

    return JsonResponse(ctx, safe=False, json_dumps_params=
                        {'ensure_ascii': False})

FLOW = client.flow_from_clientsecrets(settings.GOOGLE_OAUTH2_CLIENT_SECRETS_JSON,
                                      scope='https://www.googleapis.com/auth/calendar')



# Export OTL timetable to google calendar
@login_required
def share_calendar(request):
    user = request.user
    userprofile = user.userprofile

    try:
        table_id = int(request.GET['table_id'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    # Find the right timetable
    try:
        timetable = TimeTable.objects.get(user=userprofile, id=table_id)
    except TimeTable.DoesNotExist:
        return HttpResponseBadRequest('No such timetable')
    year = timetable.year
    semester = timetable.semester

    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    credential = storage.get()

    if credential is None or credential.invalid == True:
        FLOW.params['state'] = xsrfutil.generate_token(settings.SECRET_KEY,
                                                       request.user)
        authorize_url = FLOW.step1_get_authorize_url(redirect_uri = request.build_absolute_uri("/api/external/google/google_auth_return"))
        return HttpResponseRedirect(authorize_url)

    http = credential.authorize(httplib2.Http())
    service = discovery.build('calendar', 'v3', http=http)

    calendar_name = "[OTL] %d %s" % (year, ["Spring", "Summer", "Fall", "Winter"][semester-1])

    # Create new calendar
    calendar = {
        'summary': calendar_name,
        'timeZone': 'Asia/Seoul',
        'defaultReminders': [{
            'method': 'popup',
            'minutes': 10
        }]
    }

    created_calendar = service.calendars().insert(body=calendar).execute()
    c_id = created_calendar['id']

    class KST(datetime.tzinfo):
        _offset = datetime.timedelta(hours = 9)
        _dst = datetime.timedelta(0)
        _name = "KST"
        def utcoffset(self, dt):
            return self.__class__._offset
        def dst(self, dt):
            return self.__class__._dst
        def tzname(self, dt):
            return self.__class__._name
    semester = Semester.objects.get(year=year, semester=semester)
    start = semester.beginning.astimezone(KST()).date()
    end = semester.end.astimezone(KST()).date()
 
    for lecture in timetable.lecture.all():
        lDict = lecture.toJson(nested=False)

        for classtime in lDict['classtimes']:
            days_ahead = classtime['day'] - start.weekday()
            if days_ahead < 0:
                days_ahead += 7

            class_date = start + datetime.timedelta(days=days_ahead)
            begin_time = datetime.time(int(classtime['begin']/60),
                                       int(classtime['begin']%60))
            end_time = datetime.time(int(classtime['end']/60),
                                     int(classtime['end']%60))

            event = {
                'summary': lDict['title'],
                'location': classtime['classroom'],
                'start': {
                    'dateTime' : datetime.datetime.combine(class_date, begin_time).isoformat(),
                    'timeZone' : 'Asia/Seoul'
                    },
                'end': {
                    'dateTime' : datetime.datetime.combine(class_date, end_time).isoformat(),
                    'timeZone' : 'Asia/Seoul'
                    },
                'recurrence' : ['RRULE:FREQ=WEEKLY;UNTIL=' + end.strftime("%Y%m%d")]
            }

            service.events().insert(calendarId=c_id, body=event).execute()

    return redirect("https://calendar.google.com/calendar/r/week/%d/%d/%d"%(start.year, start.month, start.day))



@login_required
def google_auth_return(request):
    if not xsrfutil.validate_token(settings.SECRET_KEY, str(request.GET['state']),
                                   request.user):
        return HttpResponseBadRequest('Invalid token')
    credential = FLOW.step2_exchange(request.GET)
    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    storage.put(credential)
    return HttpResponseRedirect("/timetable")
    # TODO: Add calendar entry



# Fetch wishlist
@require_POST
@login_required_ajax
def wishlist_load(request):
    userprofile = request.user.userprofile


    body = json.loads(request.body.decode('utf-8'))
    try:
        year = int(body['year'])
        semester = int(body['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    w = Wishlist.objects.get_or_create(user=userprofile)[0]

    lectures = w.lectures.filter(year=year, semester=semester, deleted=False)
    result = [l.toJson(nested=False) for l in lectures]

    return JsonResponse(result, safe=False, json_dumps_params=
                        {'ensure_ascii': False})



# Add/delete lecture to wishlist.
@require_POST
@login_required_ajax
def wishlist_update(request):
    userprofile = request.user.userprofile

    body = json.loads(request.body.decode('utf-8'))
    try:
        lecture_id = body['lecture_id']
        delete = body['delete'] == True
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    w = Wishlist.objects.get(user=userprofile)
    lecture = Lecture.objects.get(id=lecture_id, deleted=False)

    if not delete:
        w.lectures.add(lecture)
    else:
        w.lectures.remove(lecture)
        
    return JsonResponse({ 'success': True })


def _rounded_rectangle(draw, points, radius, color):
    draw.pieslice([points[0], points[1], points[0]+radius*2, points[1]+radius*2], 180, 270, color)
    draw.pieslice([points[2]-radius*2, points[1], points[2], points[1]+radius*2], 270, 0, color)
    draw.pieslice([points[2]-radius*2, points[3]-radius*2, points[2], points[3]], 0, 90, color)
    draw.pieslice([points[0], points[3]-radius*2, points[0]+radius*2, points[3]], 90, 180, color)
    draw.rectangle([points[0], points[1]+radius, points[2], points[3]-radius], color)
    draw.rectangle([points[0]+radius, points[1], points[2]-radius, points[3]], color)



def _sliceText(text, width, font):
    sliced = []
    slStart = 0

    for i in range(len(text)):
        if font.getsize(text[slStart:i+1])[0] > width:
            sliced.append(text[slStart:i])
            slStart = i
    sliced.append(text[slStart:].strip())

    return sliced



def _textbox(draw, points, title, prof, loc, font):

    width = points[2] - points[0]
    height = points[3] - points[1]

    ts = _sliceText(title, width, font)
    ps = _sliceText(prof, width, font)
    ls = _sliceText(loc, width, font)

    sliced = []
    textHeight = 0

    for i in range(len(ts)+len(ps)+len(ls)):
        if i == len(ts):
            sliced.append(("", 2, (0,0,0,128)))
            textHeight += 2
        elif i == len(ts)+len(ps):
            sliced.append(("", 2, (0,0,0,128)))
            textHeight += 2

        if i < len(ts):
            sliced.append((ts[i], 24, (0,0,0,204)))
            textHeight += 24
        elif i < len(ts)+len(ps):
            sliced.append((ps[i-len(ts)], 24, (0,0,0,128)))
            textHeight += 24
        else:
            sliced.append((ls[i-len(ts)-len(ps)], 24, (0,0,0,128)))
            textHeight += 24

        if textHeight > height:
            textHeight -= sliced.pop()[1]
            break

    topPad = (height - textHeight) / 2

    textPosition = 0
    for s in sliced:
        draw.text((points[0], points[1]+topPad+textPosition), s[0], fill=s[2], font=font)
        textPosition += s[1]



@login_required
def share_image(request):
    userprofile = request.user.userprofile

    try:
        table_id = request.GET['table_id']
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    timetable = TimeTable.objects.get(user=userprofile, id=table_id)

    if settings.DEBUG:
        file_path = 'static/'
    else:
        file_path = '/var/www/otlplus/static/'

    image = Image.open(file_path+"img/Image_template.png")
    draw = ImageDraw.Draw(image)
    textImage = Image.new("RGBA", image.size)
    textDraw = ImageDraw.Draw(textImage)
    font = ImageFont.truetype(file_path+"fonts/NanumBarunGothic.ttf", 22)

    for l in timetable.lecture.all():
        lDict = l.toJson(nested=False)
        color = ['#F2CECE','#F4B3AE','#F2BCA0','#F0D3AB',
                 '#F1E1A9','#f4f2b3','#dbf4be','#beedd7',
                 '#b7e2de','#c9eaf4','#B4D3ED','#B9C5ED',
                 '#CCC6ED','#D8C1F0','#EBCAEF','#f4badb'][lDict['course']%16]
        for c in lDict['classtimes']:
            day = c['day']
            begin = c['begin'] / 30 - 16
            end = c['end'] / 30 - 16

            points = (178*day+76, 40*begin+158, 178*(day+1)+69, 40*end+151)
            _rounded_rectangle(draw, points, 4, color)

            points = (points[0]+12, points[1]+8, points[2]-12, points[3]-8)
            _textbox(textDraw, points, lDict['title'], lDict['professors_str_short'], c['classroom_short'], font)

    #image.thumbnail((600,900))

    image.paste(textImage, mask=textImage)
    response = HttpResponse(content_type="image/png")
    image.save(response, 'PNG')

    return response
