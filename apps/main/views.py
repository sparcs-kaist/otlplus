from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings


import json
import datetime

from django.views.decorators.http import require_POST

from datetime import date

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

    currenttime = datetime.date
    totalSchedule = settings.SEMESTER_RANGES[(year, semester)]

    if (len(totalSchedule) >= 6):
        for i in range(2,6):
            schedule = settings.SEMESTER_RANGES[(year, semester)][i]
            if (currenttime<schedule):
                if (i == 2): name = 'register_begin_day'
                elif (i == 3): name = 'alter_end_day'
                elif (i == 4): name = 'cancel_end_day'
                elif (i == 5): name = 'mid_evlauation_end_day'
                elif (i == 6): name = 'final_evlauation_end_day'
                break
            name = 'null'
            schedule = 'null'

    return JsonResponse({
        'name': name, 
        'date': schedule, 
    })

def _validate_year_semester(year, semester):
    return (year, semester) in settings.SEMESTER_RANGES



@require_POST
def did_you_know(request):
    try:
        key = date.today() - date(2018, 11, 13)
        key = (key.days + settings.COMPLEMENT_DYK) % len(settings.DYK_CONTENTS)
        content = settings.DYK_CONTENTS[key]
    except KeyError:
        return HttpResponseServerError('DYK key out of range')

    return JsonResponse({'today_dyk': content})
