# -*- coding: utf-8 -*-

from django.conf import settings
from django.views.decorators.http import require_http_methods, require_POST
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render

from .models import Notice, Rate

import datetime
import json
from utils.util import getint

# Create your views here.

@require_http_methods(['GET'])
def notices_view(request):
    if request.method == 'GET':
        notices = Notice.objects.all()

        time = request.GET.get('time', None)
        if time:
            notices = notices.filter(start_time__lte=time, end_time__gte=time)
        
        result = [n.toJson() for n in notices]
        return JsonResponse(result, safe=False)


@require_http_methods(['POST'])
def rate_list_view(request):
    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)
        
        current_year = datetime.datetime.now().year
        if Rate.objects.filter(user=user.userprofile, year=current_year).exists():
            return HttpResponseBadRequest('You already rated for current year')

        score = getint(body, 'score')
        if not (1 <= score <= 5):
            return HttpResponseBadRequest('Wrong field \'score\' in request data')

        rate = Rate.objects.create(score=score, user=user.userprofile, year=current_year, version=settings.VERSION)

        return HttpResponse()
