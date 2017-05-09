# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
# from apps.timetable.models import TimeTable
from apps.subject.models import Lecture, Professor, Course
from apps.review.models import Comment
from django.contrib.auth.models import User
from apps.subject.models import *
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
import datetime
import httplib2
# Misc
import os
import json

from django.views.decorators.csrf import csrf_exempt

# type_map = {'공통': '공통필수', '교필': '교양필수', '기선': '기초선택',
#             '기필': '기초필수', '석박': '석/박사', '인선': '인문사회선택',
#             '자선': '자유선택', '전선': '전공선택', '전필': '전공필수',
#             '기타': '기타'}

# type_map = {'GR':' General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
#             'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
#             'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required',
#             'S': 'Seminar', 'I': 'Interdisciplinary', 'FP': 'Field Practice'}
#
# department_map = {'인문': Department.objects.get(name='인문사회과학부'), '건환': Department.objects.get(name='건설및환경공학과'), '기경': Department.objects.get(name='기술경영학부'), '기계': Department.objects.get(name='기계공학과'), '물리': Department.objects.get(name='물리학과'), '바공': Department.objects.get(name='바이오및뇌공학과'), '산공': Department.objects.get(name='산업및시스템공학과'), '산디': Department.objects.get(name='산업디자인학과'), '생명': Department.objects.get(name='생명과학과'), '수리': Department.objects.get(name='수리과학과'), '원양': Department.objects.get(name='원자력및양자공학과'), '전자': Department.objects.get(name='전기및전자공학부'), '전산': Department.objects.get(name='전산학부'), '항공': Department.objects.get(name='항공우주공학과'), '화학': Department.objects.get(name='화학과'), '생화공': Department.objects.get(name='생명화학공학과'), '신소재': Department.objects.get(name='신소재공학과')}


# Filter Functions
def get_department_filter(raw_filters):
    department_list = []
    for department in Department.objects.all():
        department_list.append(department.code)
    major_list = ["CE", "MSB", "MAE", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                  "MS", "NQE", "HSS", "EE", "CS", "MAE", "CH"]
    etc_list = list(set(department_list) ^ set(major_list))
    if ("ALL" in raw_filters) or len(raw_filters) == 0:
        return department_list
    filters = list(set(department_list) & set(raw_filters))
    if "ETC" in raw_filters:
        filters += etc_list
    return filters


def get_type_filter(raw_filters):
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


def get_level_filter(raw_filters):
    acronym_dic = {'ALL':"", '000':"0", '100':"1", '200':"2", '300':"3", '400':"4", '500':"5", 'HIGH':"6"}
    grade_list = acronym_dic.keys()
    acronym_filters = list(set(grade_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'HIGH' in raw_filters:
        filters+=["7", "8", "9"]
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters=["0","1","2","3","4","5","6","7","8","9"]
    return filters


def get_filtered_courses(department_filters, type_filters, level_filters, keyword):
    courses = Course.objects.filter(
        department__code__in=department_filters,
        type_en__in=type_filters,
        code_num__in=level_filters
    )

    # language 에 따라서 구별해주는게 나으려나.. 영어이름만 있는 경우에는? 그러면 그냥 name 필드도 영어로 들어가나.
    if len(keyword) > 0:
        courses = courses.filter(
            Q(title__icontains=keyword) |
            Q(title_en__icontains=keyword) |
            Q(old_code__iexact=keyword) |
            Q(department__name__iexact=keyword) |
            Q(department__name_en__iexact=keyword) |
            Q(professor__in=Professor.objects.filter(name__icontains=keyword)) |
            Q(professor__in=Professor.objects.filter(name_en__icontains=keyword))
        )

    return list(courses)


def get_filtered_lectures(year, semester_filters, courses):
    return [[model_to_dict(lecture) for lecture in course.lecture_course.all()] for course in courses]


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

    return JsonResponse(ctx, safe=False, json_dumps_params=
                        {'ensure_ascii': False})


def show_lecture_comments(request):
    '''Returns comment of selected lecture'''
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

        request_json = json.loads(request.body)

        year = request_json['year']
        semester_filters = request_json['semester']
        department_filters = get_department_filter(request_json['department'])
        type_filters = get_type_filter(request_json['type'])
        level_filters = get_level_filter(request_json['level'])
        keyword = request_json['keyword']
        courses = get_filtered_courses(
            department_filters,
            type_filters,
            level_filters,
            keyword
        )
        result_course_lecture = get_filtered_lectures(year, semester_filters, courses)

        return HttpResponse(json.JSONEncoder().encode(result_course_lecture))


@csrf_exempt
def fetch(request):
    if request.method == 'POST':
        request_json = json.loads(request.body)
        lecture_name = request_json['lecture_name']
        professor_id = request_json['professor_id']
        comments = Comment.objects.filter(
            lecture__title=lecture_name,
            lecture__professor__in=Professor.objects.filter(professor_id=professor_id),
        )
        comments = [model_to_dict(x) for x in comments]
        return HttpResponse(json.JSONEncoder().encode(comments))


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

    # if calendar == None:
        # Make a new calender

    # TODO: Add calendar entry
