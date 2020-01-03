from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from apps.session.models import UserProfile
from apps.subject.models import Course, Department
from apps.main.models import RandomCourseReco, FamousReviewDailyFeed

from apps.timetable.views import _lecture_to_dict

import json
import datetime
import random
import json

from datetime import date


@require_http_methods(['GET'])
def feeds_list_view(request):
    if request.method == 'GET':
        date = request.GET.get('date', None)

        department = Department.objects.filter(code="ID").first()
        famous_review_daily_feed = FamousReviewDailyFeed.get(date=date, department=department)

        feeds = sorted([famous_review_daily_feed], key=(lambda f: f.priority))
        result = [f.toJson() for f in feeds]
        return JsonResponse(result, safe=False)


# Fetch course recommendation for writing review
# UNUSED
@require_POST
def course_write_reco_load(request):
    if not request.user.is_authenticated():
        ctx = {'lecture': None}
        return JsonResponse(ctx, safe=False, json_dumps_params=
                            {'ensure_ascii': False})

    userprofile = UserProfile.objects.get(user=request.user)

    body = json.loads(request.body.decode('utf-8'))
    try:
        yyyy, mm, dd = map(int, body['target_date'].split('-'))
        target_date = datetime.date(yyyy, mm, dd)
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    RandomCourseReco.objects.filter(userprofile=userprofile, reco_date__lte=datetime.date.today()-datetime.timedelta(days=10)).delete()

    rcr = None
    try:
        rcr = RandomCourseReco.objects.get(userprofile=userprofile, reco_date=target_date)
    except ObjectDoesNotExist:
        user_taken_lecture_list = userprofile.take_lecture_list.all()
        if len(user_taken_lecture_list) == 0:
            ctx = {'lecture': None}
            return JsonResponse(ctx, safe=False, json_dumps_params=
                                 {'ensure_ascii': False})
        l = random.choice(user_taken_lecture_list)
        rcr = RandomCourseReco(userprofile=userprofile, reco_date=target_date, lecture=l)
        rcr.save()

    ctx = _lecture_to_dict(rcr.lecture)
    return JsonResponse(ctx, safe=False, json_dumps_params=
                        {'ensure_ascii': False})


# UNUSED
@require_POST
def did_you_know(request):
    try:
        key = date.today() - date(2018, 11, 13)
        key = (key.days + settings.COMPLEMENT_DYK) % len(settings.DYK_CONTENTS)
        content = settings.DYK_CONTENTS[key]
    except KeyError:
        return HttpResponseServerError('DYK key out of range')

    return JsonResponse({'today_dyk': content})
