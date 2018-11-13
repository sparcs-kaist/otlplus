from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings


import json
import datetime


# Create your views here.

@ensure_csrf_cookie
def template(request):
    return render(request, 'index.html')

def academic_schedule_load(request):

    body = json.loads(request.body.decode('utf-8'))
    try:
        year = int(body['year'])
        semester = int(body['semester'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    if not _validate_year_semester(year, semester):
        return HttpResponseBadRequest('Invalid semester')

    currenttime = datetime.datetime.now()

    for i in range(2,7):
        schedule = settings.SEMESTER_RANGES[(year, semester)][i]
        if (currenttime<schedule):
            if (i == 2): name = 'register_begin_day'
            elif (i == 3): name = 'alter_end_day'
            elif (i == 4): name = 'cancel_end_day'
            elif (i == 5): name = 'mid_evlauation_end_day'
            elif (i == 6): name = 'final_evlauation_end_day'
            break
        name = 'null'

    return JsonResponse({
        'name': name, 
        'date': schedule, 
    }, safe=False)

def _validate_year_semester(year, semester):
    return (year, semester) in settings.SEMESTER_RANGES



