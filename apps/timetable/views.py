# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.timetable.models import TimeTable, Wishlist
from apps.subject.models import Lecture, Professor, Course
from apps.review.models import Comment
from django.contrib.auth.models import User
from apps.subject.models import *
# from apps.subject.models import ClassTime, ExamTime
from django.http.response import HttpResponseNotAllowed, HttpResponseBadRequest
from django.http import JsonResponse

# Django modules
from django.db.models import Q
from django.db import IntegrityError
from django.core import serializers
from django.forms.models import model_to_dict
from django.core.exceptions import *
from django.http import *
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.views.decorators.http import require_POST
from django.conf import settings
from django.shortcuts import render, redirect
from django.db.models import Max
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
# Misc
import os
import json
import urllib
import random
import itertools

# Pillow
from PIL import Image, ImageDraw, ImageFont



# Filter lectures by type
def _filter_department(lectures, filters):
    major_list = ["CE", "MSB", "ME", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                  "MS", "NQE", "HSS", "EE", "CS", "AE", "CH"]

    if "ALL" in filters:
        return lectures
    elif len(filters) == 0:
        return lectures.none()
    elif "ETC" in filters:
        return lectures.exclude(department__code__in = set(major_list) - set(filters))
    else:
        return lectures.filter(department__code__in = filters)



# Filter lectures by type
def _filter_type(lectures, filters):
    acronym_dic = {'GR': 'General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
                   'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
                   'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required'}

    if "ALL" in filters:
        return lectures
    elif len(filters) == 0:
        return lectures.none()
    elif "ETC" in filters:
        return lectures.exclude(type_en__in = [acronym_dic[x] for x in acronym_dic if x not in filters])
    else:
        return lectures.filter(type_en__in = [acronym_dic[x] for x in acronym_dic if x in filters])



# Filter lectures by level
def _filter_level(lectures, filters):
    acronym_dic = {'100':"1", '200':"2", '300':"3", '400':"4"}

    if "ALL" in filters:
        return lectures
    elif len(filters) == 0:
        return lectures.none()
    elif "ETC" in filters:
        return lectures.exclude(course__code_num__in = [acronym_dic[x] for x in acronym_dic if x not in filters])
    else:
        return lectures.filter(course__code_num__in = [acronym_dic[x] for x in acronym_dic if x in filters])



# Filter lectures by level
def _filter_time(lectures, day, begin, end):
    if len(day) == 0 or \
       len(begin) == 0 or \
       len(end) == 0:
        return lectures
    elif int(end) == 32:
        # End is 24:00
        return lectures.filter(classtime_set__day = int(day),
                               classtime_set__begin__gte = datetime.time(int(begin)/2+8, (int(begin)%2)*30))
    else:
        return lectures.filter(classtime_set__day = int(day),
                               classtime_set__begin__gte = datetime.time(int(begin)/2+8, (int(begin)%2)*30),
                               classtime_set__end__lte = datetime.time(int(end)/2+8, (int(end)%2)*30))



# Filter lectures by keyword
def _filter_keyword(lectures, keyword):
    if len(keyword) == 0:
        return lectures
    else:
        return lectures.filter(
            Q(title__icontains=keyword) |
            Q(title_en__icontains=keyword) |
            Q(old_code__iexact=keyword) |
            Q(department__name__iexact=keyword) |
            Q(department__name_en__iexact=keyword) |
            Q(professor__professor_name__icontains=keyword) |
            Q(professor__professor_name_en__icontains=keyword)
        ).distinct()



# Yield preset lectures from DB
def _get_preset_lectures(year, semester, code):
    if code == 'Basic':
        filter_type = ["Basic Required", "Basic Elective"]
        return Lecture.objects.filter(year=year, semester=semester,
                                      type_en__in=filter_type, deleted=False)
    elif code == 'Humanity':
        return Lecture.objects.filter(year=year, semester=semester,
                                      type_en="Humanities & Social Elective", deleted=False)
    else:
        filter_type = ["Major Required", "Major Elective", "Elective(Graduate)"]
        return Lecture.objects.filter(year=year, semester=semester,
                                      department__code=code, type_en__in=filter_type,
                                      deleted=False)



# List(Lecture) -> List[dict-Lecture]
# Format raw result from models into javascript-understandable form
def _lecture_result_format(ls, from_search = False):
    ls = ls.select_related('course', 'department') \
           .prefetch_related('classtime_set', 'examtime_set', 'professor') \
           .order_by('old_code', 'class_no')

    if from_search:
        ls = ls[:500]

    result = [_lecture_to_dict(x) for x in ls]

    return result



def _get_scores(lecture):
    comment_num = lecture.comment_num
    if comment_num == 0:
        return False, False, False
    else:
        return lecture.grade, lecture.load, lecture.speech



# Lecture -> dict-Lecture
# Convert a lecture model into dict
def _lecture_to_dict(lecture):
    cache_id = "lecture:%s:%d" % (_(u"ko"), lecture.id)
    result_cached = cache.get(cache_id)
    if result_cached != None:
        return result_cached

    # Don't change this into model_to_dict: for security and performance
    result = {"id": lecture.id,
              "title": getattr(lecture, _("title")),
              "course": lecture.course.id,
              "old_code": lecture.old_code,
              "class_no": lecture.class_no,
              "year": lecture.year,
              "semester": lecture.semester,
              "code": lecture.code,
              "department": lecture.department.id,
              "department_code": lecture.department.code,
              "department_name": getattr(lecture.department, _("name")),
              "type": getattr(lecture, _("type")),
              "type_en": lecture.type_en,
              "limit": lecture.limit,
              "num_people": lecture.num_people,
              "is_english": lecture.is_english,
              "credit": lecture.credit,
              "credit_au": lecture.credit_au,
              "common_title": getattr(lecture, _("common_title")),
              "class_title": getattr(lecture, _("class_title")),}
    
    # Add formatted professor name
    prof_name_list = [getattr(p, _("professor_name")) for p in lecture.professor.all()]
    result['professor'] = u", ".join(prof_name_list)
    if len(prof_name_list) <= 2:
      result['professor_short'] = result['professor']
    else:
      result['professor_short'] = prof_name_list[0] + _(u" 외 ") + str(len(prof_name_list)-1) + _(u"명")

    # Add formatted score
    grade, load, speech = _get_scores(lecture)
    if grade == False:
        result['has_review'] = False
        result['grade'] = 0
        result['load'] = 0
        result['speech'] = 0
        result['grade_letter'] = '?'
        result['load_letter'] = '?'
        result['speech_letter'] = '?'
    else:
        letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
        result['has_review'] = True
        result['grade'] = grade
        result['load'] = load
        result['speech'] = speech
        result['grade_letter'] = letters[int(round(grade))]
        result['load_letter'] = letters[int(round(load))]
        result['speech_letter'] = letters[int(round(speech))]

    # Add classtime
    result["classtimes"] = []
    for ct in lecture.classtime_set.all():
        bldg = getattr(ct, _("roomName"))
        # No classroom info
        if bldg == None:
            room = ""
            bldg_no = ""
            classroom = _(u"정보 없음")
            classroom_short = _(u"정보 없음")
        # Building name has form of "(N1) xxxxx"
        elif bldg[0] == "(":
            bldg_no = bldg[1:bldg.find(")")]
            bldg_name = bldg[len(bldg_no)+2:]
            room = getattr(ct, _("roomNum"))
            if room == None: room=""
            classroom = "(" + bldg_no + ") " + bldg_name + " " + room
            classroom_short = "(" + bldg_no + ") " + room
        # Building name has form of "xxxxx"
        else:
            bldg_no=""
            room = getattr(ct, _("roomNum"))
            if room == None: room=""
            classroom = bldg + " " + room
            classroom_short = bldg + " " + room

        result["classtimes"].append({"building": bldg_no,
                                     "classroom": classroom,
                                     "classroom_short": classroom_short,
                                     "room": room,
                                     "day": ct.day,
                                     "begin": ct.get_begin_numeric(),
                                     "end": ct.get_end_numeric(),})

    # Add classroom info
    if len(result['classtimes']) > 0:
        result['building'] = result['classtimes'][0]['building']
        result['classroom'] = result['classtimes'][0]['classroom']
        result['classroom_short'] = result['classtimes'][0]['classroom_short']
        result['room'] = result['classtimes'][0]['room']
    else:
        result['building'] = ''
        result['classroom'] = _(u'정보 없음')
        result['classroom_short'] = _(u'정보 없음')
        result['room'] = ''

    # Add examtime
    result["examtimes"] = []
    for et in lecture.examtime_set.all():
        day_str = [_(u"월요일"), _(u"화요일"), _(u"수요일"), _(u"목요일"), _(u"금요일"), _(u"토요일"), _(u"일요일")]
        result["examtimes"].append({"day": ct.day,
                                    "str": day_str[ct.day] + " " + ct.begin.strftime("%H:%M") + " ~ " + ct.end.strftime("%H:%M"),
                                    "begin": ct.get_begin_numeric(),
                                    "end": ct.get_end_numeric(),})

    # Add exam info
    if len(result['examtimes']) > 1:
        result['exam'] = result['examtimes'][0]['str'] + _(u" 외 ") + str(len(result['examtimes']-1)) + _("개")
    elif len(result['examtimes']) == 1:
        result['exam'] = result['examtimes'][0]['str']
    else:
        result['exam'] = _(u'정보 없음')

    cache.set(cache_id, result, 60*60)
    return result



def _user_department(user):
    if not user.is_authenticated():
        return [{'code':'Basic', 'name':_(u' 기초 과목')}]

    u = UserProfile.objects.get(user=user)

    if (u.department==None) or (u.department.code in ['AA', 'ICE']):
        departments = [{'code':'Basic', 'name':_(u' 기초 과목')}]
    else:
        departments = [{'code':u.department.code, 'name':getattr(u.department,_('name'))+_(u' 전공')}]

    for d in u.majors.all():
        data = {'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')}
        if data not in departments:
            departments.append(data)

    for d in u.minors.all():
        data = {'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')}
        if data not in departments:
            departments.append(data)

    for d in u.specialized_major.all():
        data = {'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')}
        if data not in departments:
            departments.append(data)

    for d in u.favorite_departments.all():
        data = {'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')}
        if data not in departments:
            departments.append(data)

    return departments



def _validate_year_semester(year, semester):
    return (year, semester) in settings.SEMESTER_RANGES



def main(request):
    if request.user.is_authenticated():
        departments = _user_department(request.user)
    else:
        departments = [{'code':'Basic', 'name':'기초 과목'}]

    year_semester_list = [x for x in settings.SEMESTER_RANGES]
    year_semester_list.sort(key=lambda x: x[1])
    year_semester_list.sort(key=lambda x: x[0])

    return render(request,'timetable/index.html', {'departments': departments,
                                                   'current_year':settings.CURRENT_YEAR,
                                                   'current_semester':settings.CURRENT_SEMESTER,
                                                   'start_year':year_semester_list[0][0],
                                                   'start_semester':year_semester_list[0][1],
                                                   'end_year':year_semester_list[-1][0],
                                                   'end_semester':year_semester_list[-1][1],})



# Add/Delete lecture to timetable
@require_POST
def table_update(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'success':True})

    try:
        table_id = int(request.POST['table_id'])
        lecture_id = request.POST['lecture_id']
        delete = request.POST['delete'] == u'true'
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
            return JsonResponse({ 'success': False });
    else:
        timetable.lecture.remove(lecture)
        
    return JsonResponse({ 'success': True });



# Copy timetable
@require_POST
def table_copy(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'id':random.randrange(1,100000000)})

    try:
        table_id = int(request.POST['table_id'])
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    # Find the right timetable
    target_table = TimeTable.objects.get(user=userprofile, id=table_id,
                                         year=year, semester=semester)

    lectures = target_table.lecture.all()

    t = TimeTable(user=userprofile, year=year, semester=semester)
    t.save()
    for l in lectures:
        t.lecture.add(l)
    t.save()

    return JsonResponse({'scucess': True,
                         'id':t.id})



# Delete timetable
@require_POST
def table_delete(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({})

    try:
        table_id = int(request.POST['table_id'])
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')
    
    target_table = TimeTable.objects.get(user=userprofile, id=table_id,
                                         year=year, semester=semester)
    target_table.delete()
    return JsonResponse({ 'scucess': True })



# Create timetable
@require_POST
def table_create(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'id':random.randrange(1,100000000)})

    try:
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')
    
    t = TimeTable(user=userprofile, year=year, semester=semester)
    t.save()

    return JsonResponse({'scucess': True,
                         'id':t.id})



# Fetch timetable
@require_POST
def table_load(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        ctx = [{'year':int(request.POST['year']),
                'semester':int(request.POST['semester']),
                'id':random.randrange(1,100000000),
                'lectures':[]}]
        return JsonResponse(ctx, safe=False, json_dumps_params=
                            {'ensure_ascii': False})

    try:
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    timetables = list(TimeTable.objects.filter(user=userprofile, year=year, semester=semester))

    ctx = []

    if len(timetables) == 0:
        # Create new timetable if no timetable exists
        t = TimeTable(user=userprofile, year=year, semester=semester)
        t.save()
        timetables = [t]

    for i, t in enumerate(timetables):
        timetable = model_to_dict(t, exclude='lecture')
        ctx.append(timetable)
        ctx[i]['lectures'] = _lecture_result_format(t.lecture.filter(deleted=False))

    return JsonResponse(ctx, safe=False, json_dumps_params=
                        {'ensure_ascii': False})

FLOW = client.flow_from_clientsecrets(settings.GOOGLE_OAUTH2_CLIENT_SECRETS_JSON,
                                      scope='https://www.googleapis.com/auth/calendar')



@require_POST
def autocomplete(request):
    try:
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
        keyword = request.POST['keyword']
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)

    lectures_filtered = lectures.filter(department__name__istartswith=keyword).order_by('department__name')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].department.name})

    lectures_filtered = lectures.filter(department__name_en__istartswith=keyword).order_by('department__name_en')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].department.name_en})

    lectures_filtered = lectures.filter(title__istartswith=keyword).order_by('title')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].title})

    lectures_filtered = lectures.filter(title_en__istartswith=keyword).order_by('title_en')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].title_en})

    lectures_filtered = lectures.filter(professor__professor_name__istartswith=keyword).order_by('professor__professor_name')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].professor.filter(professor_name__istartswith=keyword)[0].professor_name})

    lectures_filtered = lectures.filter(professor__professor_name_en__istartswith=keyword).order_by('professor__professor_name_en')
    if lectures_filtered.exists():
        return JsonResponse({'complete':lectures_filtered[0].professor.filter(professor_name_en__istartswith=keyword)[0].professor_name_en})

    return JsonResponse({'complete':keyword})

    



# RESTFUL search view function.
# Input example:
# Output example:
@require_POST
def search(request):
    decoded_request = urllib.unquote(request.body)
    decoded_request = decoded_request[decoded_request.find("{"):]
    decoded_request = decoded_request[:decoded_request.rfind("}")+1]
    request_json = json.loads(decoded_request)

    try:
        year = request_json['year']
        semester = request_json['semester']
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    lectures = Lecture.objects.filter(year=year, semester=semester, deleted=False)
    lectures = lectures.exclude(type_en__in=['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'])
    lectures = _filter_department(lectures, request_json.get('department', []))
    lectures = _filter_type(lectures, request_json.get('type', []))
    lectures = _filter_level(lectures, request_json.get('grade', []))
    lectures = _filter_time(lectures, request_json.get('day', ''), request_json.get('begin', ''), request_json.get('end', ''))
    lectures = _filter_keyword(lectures, request_json.get('keyword', '').replace('+', ' '))

    if len(lectures) > 500:
        too_many = True
    else:
        too_many = False
    result = _lecture_result_format(lectures, from_search = True)

    return JsonResponse({'courses':result, 'too_many':too_many},
                        safe=False,
                        json_dumps_params={'ensure_ascii': False})



@require_POST
def comment_load(request):
    try:
        lecture_id = request.POST['lecture_id']
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    lecture = Lecture.objects.get(id=lecture_id)
    comments = Comment.objects.filter(
        lecture__course=lecture.course,
        lecture__professor__in=lecture.professor.all(),
    ).order_by('-id')

    result = []
    for c in comments:
        grade, load, speech, total = c.alphabet_score()
        result.append({'grade': grade,
                       'load': load,
                       'speech': speech,
                       'like': c.like,
                       'comment': c.comment[:200],
                       'id': c.id})
    return JsonResponse(result, safe=False)



# Export OTL timetable to google calendar
@login_required_ajax
def share_calendar(request):
    user = request.user
    try:
        userprofile = UserProfile.objects.get(user=user)
    except:
        return HttpResponseServerError("userprofile not found")

    try:
        table_id = int(request.GET['table_id'])
        year = int(request.GET['year'])
        semester = int(request.GET['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    credential = storage.get()

    if credential is None or credential.invalid == True:
        FLOW.params['state'] = xsrfutil.generate_token(settings.SECRET_KEY,
                                                       request.user)
        authorize_url = FLOW.step1_get_authorize_url(redirect_uri = request.build_absolute_uri("/timetable/google_auth_return"))
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

    # Find the right timetable
    try:
        timetable = TimeTable.objects.get(user=userprofile, id=table_id,
                                          year=year, semester=semester)
    except:
        return HttpResponseBadRequest('Missing fields in request data')

    start = settings.SEMESTER_RANGES[(year,semester)][0]
    end = settings.SEMESTER_RANGES[(year,semester)][1] + datetime.timedelta(days=1)
 
    for lecture in timetable.lecture.all():
        lDict = _lecture_to_dict(lecture)

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
        return HttpResponseBadRequest('Missing fields in request data')
    credential = FLOW.step2_exchange(request.GET)
    storage = DjangoORMStorage(UserProfile, 'user', request.user, 'google_credential')
    storage.put(credential)
    return HttpResponseRedirect("/timetable")
    # TODO: Add calendar entry



@require_POST
def list_load_major(request):
    try:
        year = int(request.POST["year"])
        semester = int(request.POST["semester"])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    departments = [x['code'] for x in _user_department(request.user)]
    result = []
    for major_code in departments:
        lectures = _get_preset_lectures(year, semester, major_code)
        lectures = _lecture_result_format(lectures)
        for l in lectures:
            l['major_code'] = major_code
            result.append(l)

    return JsonResponse(result, safe=False)



@require_POST
def list_load_humanity(request):
    try:
        year = int(request.POST["year"])
        semester = int(request.POST["semester"])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    lectures = _get_preset_lectures(year, semester, "Humanity")
    result = _lecture_result_format(lectures)

    return JsonResponse(result, safe=False)



# Fetch wishlist
@require_POST
def wishlist_load(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse([], safe=False, json_dumps_params=
                            {'ensure_ascii': False})

    try:
        year = int(request.POST['year'])
        semester = int(request.POST['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    w = Wishlist.objects.get_or_create(user=userprofile)

    lectures = w.lectures.filter(year=year, semester=semester, deleted=False)
    result = _lecture_result_format(lectures)

    return JsonResponse(result, safe=False, json_dumps_params=
                        {'ensure_ascii': False})



# Add/delete lecture to wishlist.
@require_POST
def wishlist_update(request):
    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'success':True})

    try:
        lecture_id = request.POST['lecture_id']
        delete = request.POST['delete'] == u'true'
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    w = Wishlist.objects.get(user=userprofile)
    lecture = Lecture.objects.get(id=lecture_id, deleted=False)

    if not delete:
        w.lectures.add(lecture)
    else:
        w.lectures.remove(lecture)
        
    return JsonResponse({ 'success': True });


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



@login_required_ajax
def share_image(request):
    userprofile = UserProfile.objects.get(user=request.user)

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
        lDict = _lecture_to_dict(l)
        color = ['#F2CECE','#F4AEAE','#F2BCA0','#F1D6B2',
                 '#F1E1A9','#f4f2b3','#dbf4be','#beedd7',
                 '#b7e2de','#c9eaf4','#b4c9ed','#b4bbef',
                 '#c4c3e5','#bcabef','#e1caef','#f4badb'][lDict['course']%16]
        for c in lDict['classtimes']:
            day = c['day']
            begin = c['begin'] / 30 - 16
            end = c['end'] / 30 - 16

            points = (178*day+76, 40*begin+158, 178*(day+1)+69, 40*end+151)
            _rounded_rectangle(draw, points, 4, color)

            points = (points[0]+12, points[1]+8, points[2]-12, points[3]-8)
            _textbox(textDraw, points, lDict['title'], lDict['professor'], c['classroom_short'], font)

    #image.thumbnail((600,900))

    image.paste(textImage, mask=textImage)
    response = HttpResponse(content_type="image/png")
    image.save(response, 'PNG')

    return response
