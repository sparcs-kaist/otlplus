# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from apps.subject.models import Lecture, ClassTime, ExamTime
# Django modules
from django.core.exceptions import *
from django.http import *
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.conf import settings
from django.shortcuts import render
# For google calender
from apiclient import discovery
import oauth2client
from oauth2client import client
from oauth2client import tools
from oauth2client.client import OAuth2WebServerFlow
import datetime
import httplib2
import json

# Misc
import os
def test(request):
    context = {'pagetTitle': 'JADE 사용', 'youAreUsingJade': True}
    return render(request, 'test.jade', context)

def main(request):
    return render(request, 'timetable/index.html')

#HELPER_FUNCTION_FOR_JSON#########################################
def time_to_int(some_time):
	si = int(str(some_time).split(":")[0])
	bun = int(str(some_time).split(":")[1])
	return si * 60 + bun

def makelec_json(some_lec):
	res_name = some_lec.title
	res_name_en = some_lec.title_en

	res_code = some_lec.code
	if len(some_lec.class_no) > 0:
		res_code += ("(%s)" % (some_lec.class_no))
	
	res_prof = ""
	for each_prof in some_lec.professor.all():
		res_prof += each_prof.professor_name + ", "
	res_prof = res_prof[:-1]
	
	res_room = []
	res_room_en = []
	for each_ctime in ClassTime.objects.filter(lecture=some_lec):
		each_room = each_ctime.roomName_ko
		each_room_en = each_ctime.roomName_en
		if not each_room in res_room and each_room is not None:
			res_room.append(each_room)
		if not each_room_en in res_room_en and each_room_en is not None:
			res_room_en.append(each_room_en)
	if len(res_room) > 0:
		res_room = ', '.join(res_room)
	else:
		res_room = ""
	if len(res_room_en) > 0:
		res_room_en = ', '.join(res_room_en)
	else:
		res_room_en = ""

	if some_lec.num_people == 0:
		res_pnum = "unlimited"
	else:
		res_pnum = str(some_lec.num_people)
	
	yoil = [None,'Mon','Tue','Wed','Thu','Fri','Sat','Sun']
	each_etime = ExamTime.objects.filter(lecture=some_lec)
	if len(each_etime) == 0:
		res_exam = "X"
	else:
		try:
			res_exam = yoil[each_etime[0].day] + " " + str(each_etime[0].begin)[:-3] + " ~ " + str(each_etime[0].end)[:-3]
		except:
			res_exam = "error"
	each_context = {
		"name" : res_name,
		"name_en" : res_name_en,
		"code" : res_code,
		"prof" : res_prof,
		#"room" : res_room,
		"pnum" : res_pnum,
		"exam" : res_exam,
	}
	return each_context

##################################################################

#JUST_FOR_TEST_PART(jihoon)#######################################
"""
def clicktest(request):
    return render(request, 'timetable/clicktest.html')
def cs101json(request):
    context = {
        "name" : "Introduction to Programming",
        "code" : "CS101(J)",
        "prof" : "Younghee Lee",
        "room" : "E11 #403",
        "pnum" : "45",
        "exam" : "Mon 19:00 ~ 21:00"
    }
    return JsonResponse(json.dumps(context),safe=False)
def cs322json(request):
    context = {
        "name" : "Formal Language and Automata",
        "code" : "CS322",
        "prof" : "Pangmu Choi",
        "room" : "E11 #311",
        "pnum" : "135",
        "exam" : "Tue 13:15 ~ 15:15"
    }
    return JsonResponse(json.dumps(context),safe=False)
"""

def dragresult_json(request):
	#request.method=='POST'
	year = int(request.GET['year']) # 4 digit number
	semester = int(request.GET['semester']) # 1(spring),2(summer),3(fall),4(winter)
	start_time = int(request.GET['start_block']) * 30 + 480 #0 : AM 08:00 ~ 31 : PM 11 : 30 (interval is 30min)
	end_time = int(request.GET['end_block']) * 30 + 480
	start_day = int(request.GET['start_day']) #1 : Monday, 2 : Tuesday, ..., 7 : Sunday
	end_day = int(request.GET['end_day'])
	if start_time > end_time:
		start_time, end_time = end_time, start_time
	end_time += 1 # <- just for range
	if start_day > end_day:
		start_day, end_day = end_day, start_day
	#end_day += 1 # <- just for range
	ClassTimeList = ClassTime.objects.all()
	IncludeLec = []
	for each_ctime in ClassTimeList:
		lec = each_ctime.lecture
		if lec in IncludeLec: continue
		if lec.year == year and lec.semester == semester:
			if start_time <= time_to_int(each_ctime.begin) and time_to_int(each_ctime.end) <= end_time:
				if start_day <= each_ctime.day and each_ctime.day <= end_day:
					# can be target
					IncludeLec.append(lec)
	context = []
	for each_lec in IncludeLec:
		context.append(makelec_json(each_lec))
	return JsonResponse(json.dumps(context),safe=False)

##################################################################
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

