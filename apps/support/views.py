import json

from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from .models import Notice, Rate
from utils.util import getint


# Create your views here.


@require_http_methods(["GET"])
def notices_view(request):
    notices = Notice.objects.all()

    time = request.GET.get("time", None)
    if time:
        notices = notices.filter(start_time__lte=time, end_time__gte=time)

    result = [n.toJson() for n in notices]
    return JsonResponse(result, safe=False)


@require_http_methods(["POST"])
def rate_list_view(request):
    body = json.loads(request.body.decode("utf-8"))

    user = request.user
    if user is None or not user.is_authenticated:
        return HttpResponse(status=401)

    current_year = timezone.now().year
    if Rate.objects.filter(user=user.userprofile, year=current_year).exists():
        return HttpResponseBadRequest("You already rated for current year")

    score = getint(body, "score")
    if not (1 <= score <= 5):
        return HttpResponseBadRequest("Wrong field 'score' in request data")

    Rate.objects.create(score=score, user=user.userprofile, year=current_year, version=settings.VERSION)

    return HttpResponse()
