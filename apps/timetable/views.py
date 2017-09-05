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
from django.views.decorators.csrf import csrf_exempt

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
from django.db.models import Max
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.utils import translation
from django.core.cache import cache

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
import urllib
import random
import itertools

from django.views.decorators.csrf import csrf_exempt



# Convert given depertment filter into DB-understandable form
def _get_department_filter(raw_filters):
    department_list = []
    for department in Department.objects.all():
        department_list.append(department.code)
    major_list = ["CE", "MSB", "ME", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                  "MS", "NQE", "HSS", "EE", "CS", "AE", "CH"]
    etc_list = list(set(department_list) ^ set(major_list))
    if ("ALL" in raw_filters) or len(raw_filters) == 0:
        return department_list
    filters = list(set(department_list) & set(raw_filters))
    if "ETC" in raw_filters:
        filters += etc_list
    return filters



# Convert given type filter into DB-understandable form
def _get_type_filter(raw_filters):
    acronym_dic = {'GR': 'General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
                   'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
                   'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required',
                   'S': 'Seminar', 'I': 'Interdisciplinary', 'FP': 'Field Practice'}
    type_list = acronym_dic.keys()
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters = [acronym_dic[i] for i in type_list if acronym_dic.has_key(i)]
        return filters
    acronym_filters = list(set(type_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'ETC' in raw_filters:
        filters += ["Seminar", "Interdisciplinary", "Field Practice"]
    return filters



# Convert given level filter into DB-understandable form
def _get_level_filter(raw_filters):
    acronym_dic = {'ALL':"", '000':"0", '100':"1", '200':"2", '300':"3", '400':"4", '500':"5", 'HIGH':"6"}
    grade_list = acronym_dic.keys()
    acronym_filters = list(set(grade_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'HIGH' in raw_filters:
        filters+=["7", "8", "9"]
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters=["0","1","2","3","4","5","6","7","8","9"]
    return filters



# Yield lectures from DB
def _get_filtered_lectures(year, semester, department_filters, type_filters, level_filters, keyword, day, begin, end):
    lectures = Lecture.objects.filter(
        year=year,
        semester=semester,
        department__code__in=department_filters,
        type_en__in=type_filters,
        course__code_num__in=level_filters,
        deleted=False
    )

    if day!=None and begin!=None and end!=None:
        lectures = lectures.filter(classtime_set__day=day, classtime_set__begin__gte=begin, classtime_set__end__lte=end)

    # language 에 따라서 구별해주는게 나으려나.. 영어이름만 있는 경우에는? 그러면 그냥 name 필드도 영어로 들어가나.
    if len(keyword) > 0:
        lectures = lectures.filter(
            Q(title__icontains=keyword) |
            Q(title_en__icontains=keyword) |
            Q(old_code__iexact=keyword) |
            Q(department__name__iexact=keyword) |
            Q(department__name_en__iexact=keyword) |
            Q(professor__professor_name__icontains=keyword) |
            Q(professor__professor_name_en__icontains=keyword)
        ).distinct()

    return lectures



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
        filter_type = ["Major Required", "Major Elective"]
        return Lecture.objects.filter(year=year, semester=semester,
                                      department__code=code, type_en__in=filter_type,
                                      deleted=False)



# List(Lecture) -> List[dict-Lecture]
# Format raw result from models into javascript-understandable form
def _lecture_result_format(ls):
    result = [_lecture_to_dict(x) for x in ls]
    result.sort(key = (lambda x:x['class_no']))
    result.sort(key = (lambda x:x['old_code']))
    
    return result



# Convert a classtime model into dict
def _classtime_to_dict(ct):
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

    return {"building": bldg_no,
            "classroom": classroom,
            "classroom_short": classroom_short,
            "room": room,
            "day": ct.day,
            "begin": ct.get_begin_numeric(),
            "end": ct.get_end_numeric(),}



# Convert a examtime model into dict
def _examtime_to_dict(ct):
    day_str = [_(u"월요일"), _(u"화요일"), _(u"수요일"), _(u"목요일"), _(u"금요일"), _(u"토요일"), _(u"일요일")]
    return {"day": ct.day,
            "str": day_str[ct.day] + " " + ct.begin.strftime("%H:%M") + " ~ " + ct.end.strftime("%H:%M"),
            "begin": ct.get_begin_numeric(),
            "end": ct.get_end_numeric(),}



def _get_scores(lecture):
    related = Lecture.objects.filter(course=lecture.course, professor__in=lecture.professor.all())
    comment_num = sum(r.comment_num for r in related)
    if comment_num == 0:
        return False, False, False
    else:
        grade = float(sum(r.grade_sum for r in related))
        load = float(sum(r.grade_sum for r in related))
        speech = float(sum(r.speech_sum for r in related))
        return grade/comment_num, load/comment_num, speech/comment_num



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
              "class_title": getattr(lecture, _("class_title")),
              "classtimes": [_classtime_to_dict(ct) for ct in lecture.classtime_set.all()],
              "examtimes": [_examtime_to_dict(et) for et in lecture.examtime_set.all()],}
    
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
        letters = ['?', '?', '?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
        result['has_review'] = True
        result['grade'] = grade
        result['load'] = load
        result['speech'] = speech
        result['grade_letter'] = letters[int(round(grade))]
        result['load_letter'] = letters[int(round(load))]
        result['speech_letter'] = letters[int(round(speech))]

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
        if d.code not in departments:
            departments.append({'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')})

    for d in u.minors.all():
        if d.code not in departments:
            departments.append({'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')})

    for d in u.specialized_major.all():
        if d.code not in departments:
            departments.append({'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')})

    for d in u.favorite_departments.all():
        if d.code not in departments:
            departments.append({'code':d.code, 'name':getattr(d,_('name'))+_(u' 전공')})

    return departments



def main(request):
    if request.user.is_authenticated():
        departments = _user_department(request.user)
    else:
        departments = [{'code':'Basic', 'name':'기초 과목'}]

    return render(request,'timetable/index.html', {'departments': departments, 'year':2017, 'semester':3})



# Get current year and semester.
# If lectures are updated, we can get latest year and semester
# from its year and semester fields. Its quite naaive way of determining, so
# if models aren't updated we can't get current year and semester info
def _year_semester():
    year = Lecture.objects.aggregate(Max('year'))['year__max']
    semester = Lecture.objects.filter(year=year) \
                              .aggregate(Max('semester'))['semester__max']
    return (year, semester)
    


# Add/Delete lecture to timetable
def table_update(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'success':True})

    if 'table_id' not in request.POST or 'lecture_id' not in request.POST or \
       'delete' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])
    lecture_id = request.POST['lecture_id']
    delete = request.POST['delete'] == u'true'

    # Find the right timetable
    timetable = TimeTable.objects.get(user=userprofile, id=table_id)
    # Find the right lecture
    lecture = Lecture.objects.get(id=lecture_id, deleted=False)

    if timetable.year!=lecture.year or timetable.semester!=lecture.semester:
        raise ValidationError('Semester not matching')

    if not delete:
        timetable.lecture.add(lecture)
    else:
        timetable.lecture.remove(lecture)
        
    return JsonResponse({ 'success': True });



# Copy timetable
def table_copy(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'id':random.randrange(1,100000000)})

    if 'table_id' not in request.POST or \
       'year' not in request.POST or 'semester' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])
    year = int(request.POST['year'])
    semester = int(request.POST['semester'])
    
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
def table_delete(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({})

    if 'table_id' not in request.POST or 'year' not in request.POST or \
       'semester' not in request.POST:
        return HttpResponseBadRequest()

    table_id = int(request.POST['table_id'])
    year = int(request.POST['year'])
    semester = int(request.POST['semester'])
    
    tables = list(TimeTable.objects.filter(user=userprofile, id=table_id,
                                           year=year, semester=semester))
    if len(tables) == 0:
        return JsonResponse({ 'success': False, 'reason': 'No such timetable exist' })

    tables[0].delete()
    return JsonResponse({ 'scucess': True })



# Create timetable
def table_create(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'id':random.randrange(1,100000000)})

    if 'year' not in request.POST or 'semester' not in request.POST:
        return HttpResponseBadRequest()

    year = int(request.POST['year'])
    semester = int(request.POST['semester'])

    if semester!=1 and semester!=3:
        raise ValidationError('Invalid semester')
    
    t = TimeTable(user=userprofile, year=year, semester=semester)
    t.save()

    return JsonResponse({'scucess': True,
                         'id':t.id})



# Fetch timetable
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

    year = int(request.POST['year'])
    semester = int(request.POST['semester'])
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




# Returns comment of selected lecture
def show_lecture_comments(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    code = request.POST['code']
    comments = Comment.objects.filter(code = code)



# RESTFUL search view function. Test with programs like postman. csrf_exempt is for testing.
# Input example:
# Output example:
@csrf_exempt
def search(request):
    if request.method == 'POST':
        decoded_request = urllib.unquote(request.body)
        decoded_request = decoded_request[decoded_request.find("{"):]
        decoded_request = decoded_request[:decoded_request.rfind("}")+1]
        request_json = json.loads(decoded_request)

        year = request_json['year']
        semester = request_json['semester']
        department_filters = _get_department_filter(request_json['department'])
        type_filters = _get_type_filter(request_json['type'])
        level_filters = _get_level_filter(request_json['grade'])
        keyword = request_json['keyword']

        if len(request_json["day"])>0 and len(request_json["begin"])>0 and len(request_json["end"])>0:
            day = int(request_json["day"])
            beginIdx = int(request_json["begin"])
            begin = datetime.time(beginIdx/2+8, (beginIdx%2)*30)
            endIdx = int(request_json["end"])
            end = datetime.time(endIdx/2+8, (endIdx%2)*30)
        else:
            day = None
            begin = None
            end = None
        
        result = _get_filtered_lectures(year, semester, department_filters, type_filters, level_filters, keyword, day, begin, end)
        if len(result) > 500:
            too_many = True
            result = result[:500]
        else:
            too_many = False
        result = _lecture_result_format(result)

        return JsonResponse({'courses':result, 'too_many':too_many},
                            safe=False,
                            json_dumps_params={'ensure_ascii': False})



@csrf_exempt
def comment_load(request):
    if request.method == 'POST':
        lecture_id = request.POST['lecture_id']
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
                           'comment': c.comment[:200],
                           'id': c.id})
        return JsonResponse(result, safe=False)



# Export OTL timetable to google calender
@login_required_ajax
def calendar(request):
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

    # if calendar == None:
        # Make a new calender

    # TODO: Add calendar entry



def list_load_major(request):
    if request.method == "POST":
        import time
        t = time.time()

        year = int(request.POST["year"])
        semester = int(request.POST["semester"])

        departments = [x['code'] for x in _user_department(request.user)]
        lectures_nested = [_get_preset_lectures(year, semester, x) for x in departments]
        lectures = [y for x in lectures_nested for y in x]
        result = _lecture_result_format(lectures)

        print(time.time()-t)
        return JsonResponse(result, safe=False)



def list_load_humanity(request):
    if request.method == "POST":
        year = int(request.POST["year"])
        semester = int(request.POST["semester"])

        lectures = _get_preset_lectures(year, semester, "Humanity")
        result = _lecture_result_format(lectures)

        return JsonResponse(result, safe=False)



# Fetch wishlist
def wishlist_load(request):
    if request.method == 'POST':
        try:
            userprofile = UserProfile.objects.get(user=request.user)
        except:
            return JsonResponse([], safe=False, json_dumps_params=
                                {'ensure_ascii': False})


        year = int(request.POST['year'])
        semester = int(request.POST['semester'])

        try:
            w = Wishlist.objects.get(user=userprofile)
        except Wishlist.DoesNotExist:
            w = Wishlist(user=userprofile)
            w.save()

        lectures = w.lectures.filter(year=year, semester=semester, deleted=False)
        result = _lecture_result_format(lectures)

        return JsonResponse(result, safe=False, json_dumps_params=
                            {'ensure_ascii': False})



# Add/delete lecture to wishlist.
def wishlist_update(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('POST')

    try:
        userprofile = UserProfile.objects.get(user=request.user)
    except:
        return JsonResponse({'success':True})

    if 'lecture_id' not in request.POST:
        return HttpResponseBadRequest()

    lecture_id = request.POST['lecture_id']
    delete = request.POST['delete'] == u'true'
    w = Wishlist.objects.get(user=userprofile)
    lecture = Lecture.objects.get(id=lecture_id, deleted=False)

    if not delete:
        w.lectures.add(lecture)
    else:
        w.lectures.remove(lecture)
        
    return JsonResponse({ 'success': True });


