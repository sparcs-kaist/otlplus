# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.timetable.models import TimeTable
from apps.subject.models import Lecture
from django.contrib.auth.models import User
from apps.subject.models import Lecture, ClassTime, ExamTime
from django.http.response import HttpResponseNotAllowed, HttpResponseBadRequest
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Django modules
from django.core import serializers
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


def search_temp(request):
    return render(request, 'timetable/search_temp.html')


def search_temp_ajax(request):
    if request.method == 'POST':
        keyword = request.POST['keyword']
        result = Lecture.objects.filter(title__icontains=keyword).filter(year=2016)
        json_result = serializers.serialize('json', result)
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

   #if calendar == None:
       # Make a new calender

   # TODO: Add calendar entry



# update wishlist
@csrf_exempt
def wishlist(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		lecture_name = data['lecture_name'].encode('utf-8')
		print lecture_name
		class_no = data['class_no']
		lectures = list(Lecture.objects.filter(year=2015, semester=3, title=lecture_name, class_no=class_no))
		if len(lectures) == 0:
			return JsonResponse({'success': False, 'error_message': 'Lecture not found'})
		elif len(lectures) > 1:
			return JsonResponse({'success': False, 'error_message': 'Lecture too many'})
		else:
			return JsonResponse({'success': True})				
