from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError, JsonResponse
from django.conf import settings
from datetime import date

# Create your views here.

def home(request):
    return HttpResponse("main!")

def did_you_know(request):
    try:
        key = date.today() - date(2018, 11, 13)
        key = (key.days + settings.COMPLEMENT_DYK) % len(settings.DYK_CONTENTS)
        content = settings.DYK_CONTENTS[key]
    except KeyError:
        return HttpResponseServerError('DYK key out of range')

    return JsonResponse({'today_dyk': content})

