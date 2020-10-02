from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from utils.decorators import login_required_ajax

from apps.session.models import UserProfile
from apps.subject.models import Course, Department
from apps.main.models import FamousMajorReviewDailyFeed, FamousHumanityReviewDailyFeed, ReviewWriteDailyUserFeed, RelatedCourseDailyUserFeed

from apps.timetable.views import _user_department

import json
import datetime
import random
import json

from datetime import date


@login_required_ajax
@require_http_methods(['GET'])
def feed_list_view(request):
    if request.method == 'GET':
        date = request.GET.get('date', None)
        userprofile = request.user.userprofile

        department_codes = [d['code'] for d in _user_department(request.user) if (d['code'] != 'Basic')]
        departments = Department.objects.filter(code__in=department_codes, visible=True)
        famous_major_review_daily_feed_list = [FamousMajorReviewDailyFeed.get(date=date, department=d, departments_num=departments.count()) for d in departments]

        famous_humanity_review_daily_feed = FamousHumanityReviewDailyFeed.get(date=date)

        review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)

        related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)

        feeds = famous_major_review_daily_feed_list \
            + [famous_humanity_review_daily_feed] \
            + [review_write_daily_user_feed] \
            + [related_course_daily_user_feed]
        feeds = [f for f in feeds if (f != None)]
        feeds = sorted(feeds, key=(lambda f: f.priority))
        result = [f.toJson(user=request.user) for f in feeds]
        return JsonResponse(result, safe=False)
