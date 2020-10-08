# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.views.decorators.http import require_http_methods, require_POST
from django.http import JsonResponse
from django.shortcuts import render

from .models import Notice


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
