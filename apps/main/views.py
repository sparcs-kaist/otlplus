from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from utils.decorators import login_required_ajax

from apps.session.models import UserProfile
from apps.subject.models import Course, Department
from apps.main.models import RandomCourseReco, FamousMajorReviewDailyFeed, FamousHumanityReviewDailyFeed, ReviewWriteDailyUserFeed, RelatedCourseDailyUserFeed

from apps.timetable.views import _user_department
from apps.timetable.views import _lecture_to_dict

import json
import datetime
import random
import json

from datetime import date


@login_required_ajax
@require_http_methods(['GET'])
def feeds_list_view(request):
    if request.method == 'GET':
        date = request.GET.get('date', None)
        user = UserProfile.objects.get(user=request.user)

        department_codes = [d['code'] for d in _user_department(request.user) if (d['code'] != 'Basic')]
        departments = Department.objects.filter(code__in=department_codes, visible=True)
        famous_major_review_daily_feed_list = [FamousMajorReviewDailyFeed.get(date=date, department=d) for d in departments]

        famous_humanity_review_daily_feed = FamousHumanityReviewDailyFeed.get(date=date)

        review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=user)

        related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=user)

        feeds = famous_major_review_daily_feed_list \
            + [famous_humanity_review_daily_feed] \
            + [review_write_daily_user_feed] \
            + [related_course_daily_user_feed]
        feeds = sorted(feeds, key=(lambda f: f.priority))
        result = [f.toJson(user=request.user) for f in feeds]
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
