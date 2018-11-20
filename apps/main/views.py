from django.shortcuts import render
from django.http import HttpResponse, HttpResponseServerError, JsonResponse
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from datetime import date

# Create your views here.

@ensure_csrf_cookie
def template(request):
    return render(request, 'index.html')

@require_POST
def did_you_know(request):
    try:
        key = date.today() - date(2018, 11, 13)
        key = (key.days + settings.COMPLEMENT_DYK) % len(settings.DYK_CONTENTS)
        content = settings.DYK_CONTENTS[key]
    except KeyError:
        return HttpResponseServerError('DYK key out of range')

    return JsonResponse({'today_dyk': content})