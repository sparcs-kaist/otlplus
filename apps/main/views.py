from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST

from apps.session.models import UserProfile
from apps.subject.models import Course
from apps.main.models import RandomCourseReco
import datetime
import random

# Create your views here.

@ensure_csrf_cookie
def template(request):
    return render(request, 'index.html')

# Fetch course recommendation for writing review
@require_POST
def course_write_reco_load(request):
    if not request.user.is_authenticated():
        ctx = [{'lecture':[]}]
        return JsonResponse(ctx, safe=False, json_dumps_params=
                            {'ensure_ascii': False})

    userprofile = UserProfile.objects.get(user=request.user)

    body = json.loads(request.body.decode('utf-8'))
    try:
        target_date = int(body['target_date'])
    except KeyError:
        return HttpResponseBadRequest('Missing fields in request data')

    RandomCourseReco.objects.filter(userprofile=userprofile, reco_date__lte=datetime.date.today()-datetime.timedelta(days=10)).delete()

    rcr = None
    try:
        rcr = RandomCourseReco.objects.get(userprofile=userprofile, reco_date=target_date)
    except DoesNotExist:
        user_taken_lecture_list = userprofile.take_lecture_list.all()
        if len(user_taken_lecture_list) == 0:
            ctx = [{'lecture': []}]
            return JsonResponse(ctx, safe=False, json_dumps_params=
                                 {'ensure_ascii': False})
        l = random.choice(user_taken_lecture_list)
        rcr = RandomCourseReco(userprofile=userprofile, reco_date=target_date, lecture=l)
        rcr.save()

    ctx = [{'lecture':_lecture_result_format([rcr.lecture])}]
    return JsonResponse(ctx, safe=False, json_dumps_params=
                        {'ensure_ascii': False})
