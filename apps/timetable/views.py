# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.timetable.models import ResearchLecture
from apps.subject.models import ExamTime, ClassTime, Lecture

# Django modules
from django.core.exceptions import *
from wsgiref.util import FileWrapper
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import *
from django.shortcuts import render
from django.template.loader import render_to_string
from django.http.response import HttpResponseBadRequest

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
import pdfkit
import tempfile
import json

def test(request):
    context = {'pagetTitle': 'JADE 사용', 'youAreUsingJade': True}
    return render(request, 'test.jade', context)


def main(request):
    return render(request, 'timetable/index.html')



def get_lecture_info(request):
    """과목 선택시(클릭, 드래그시) 정보를 가져온다"""
    if not request.is_ajax() or request.method != 'GET':
        return HttpResponseBadRequest()

    #data = json.loads(request.body)
    try:
        #research_lecture = ResearchLecture.objects.get(code=1553)
        lecture = Lecture.objects.get(code='36.420')
        classtime = ClassTime.objects.get(lecture=lecture)
        examtime = ExamTime.objects.get(lecture=lecture)
    except ObjectDoesNotExist:
        lecture = None

    if lecture is not None:
        result = {
            'title': lecture.title, # 프로그래밍기초
            'old_code': lecture.old_code, # CS101
            'class_no': lecture.class_no, # B
            'course_type': lecture.course_type, # 전필, 전선 ...
            'department': [d.name for d in lecture.department], # 전산학과
            'professor': [p.professor_name for p in lecture.professor], # 김순태, 한태숙
            'limit': lecture.limit, # 정원(50)
            'classroom': classtime.building + ' ' + classtime.roomName_ko + ' ' + classtime.roomNum +
              '호', # E11 창의합습관303호
            'examtime': '금요일',
            'language': 'Kor' if lecture.is_english else 'Eng',
            'credit': lecture.credit_au,
            'rate': lecture.num_people / lecture.limit # 경쟁률
            }
    else:
        result = {}
    return JsonResponse(result)



@login_required
def calendar(request):
    """ Exports otl timetable to google calender """
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

    if userprofile.calendar_id != None:
        try:
            calendar = service.calendars().get(calendarId = userprofile.calendar_id).execute()
            if calendar != None and calendar['summary'] != calendar_name:
                calendar['summary'] = calendar_name
                calendar = service.calendars().update(calendarId = calendar['id'], body = calendar).execute()
        except:
            pass

   #if calendar == None:
       # Make a new calender

   # TODO: Add calendar entry

def _make_timetable_html(request):
   ''' From request make a html(string) used for printing or exporting '''
   table_id = int(request.GET.get('id', 0))
   view_year = int(request.GET.get('view_year', settings.NEXT_YEAR))
   view_semester = int(request.GET.get('view_semester', settings.NEXT_SEMESTER))

   # Load appropriate models

   return render_to_string('timetable/print.jade', context=None,
                           request=request)

def _get_pdf(rendered_string):
    html_num, html_path = tempfile.mkstemp(suffix='.html', dir='/tmp')
    html_file = open(html_path, 'w')
    html_file.write(rendered_string.encode('utf-8'))
    html_file.close()

    pdf_num, pdf_path = tempfile.mkstemp(suffix='.pdf', dir='/tmp')

    cmd = 'prince -i=html --media=screen '

    css_list = ['css/bootstrap.min.css', 'css/font-awesome.min.css',
                'css/gobal.css', 'css/components/header/result.css', 'css/table.css',
                'css/timetable/table.css', 'css/timetable/timetable.css']
    for css in css_list:
        cmd += '-s '
        cmd += os.path.join(settings.STATICFILES_DIRS, css)
        cmd += ' '

    cmd += html_path
    cmd += ' -o ' + pdf_path

    os.system(cmd)

    return pdf_path


@login_required
def save_as_pdf(request):
   ''' Serve pdf file based on request and template '''
   table_id = int(request.GET.get('id', 0))
   view_year = int(request.GET.get('view_year', settings.NEXT_YEAR))
   view_semester = int(request.GET.get('view_semester', settings.NEXT_SEMESTER))
   old_lang = request.session.get('django_language', 'ko')

   f = open(_get_pdf(_render_html(request)), 'rb')

   response = HttpResponse(FileWrapper(f), content_type='appication/pdf')
   activate('en')
   response['Content-Disposition'] = 'attachment; filename=timetable%d_%d_%d.pdf' % (table_id + 1, view_year, view_semester)
   activate(old_lang)

   return response


@login_required
def save_as_image(request):
   ''' Serve png file based on request and temlplate '''
   table_id = int(request.GET.get('id', 0))
   view_year = int(request.GET.get('view_year', settings.NEXT_YEAR))
   view_semester = int(request.GET.get('view_semester', settings.NEXT_SEMESTER))
   old_lang = request.session.get('django_language', 'ko')

   f = open(_get_image(_render_html(request)), 'rb')

   response = HttpResponse(FileWrapper(f), content_type='image/png')
   activate('en')
   response['Content-Disposition'] = 'attachment; filename=timetable%d_%d_%d.png' % \
     (table_id + 1, view_year, view_semester)
   activate(old_lang)

   return response
