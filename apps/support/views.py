import json

from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import apply_order, getint

from .models import Notice, Rate


class NoticeListView(View):
    DEFAULT_ORDER = ['start_time', 'id']

    def get(self, request):
        notices = Notice.objects.all()

        time = request.GET.get("time", None)
        if time:
            notices = notices.filter(start_time__lte=time, end_time__gte=time)

        notices = apply_order(notices, request.GET, NoticeListView.DEFAULT_ORDER)
        result = [n.toJson() for n in notices]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class RateListView(View):
    def post(self, request):
        body = json.loads(request.body.decode("utf-8"))

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)

        current_year = timezone.now().year
        if Rate.objects.filter(user=user.userprofile, year=current_year).exists():
            return HttpResponseBadRequest("You already rated for current year")

        score = getint(body, "score")
        if not 1 <= score <= 5:
            return HttpResponseBadRequest("Wrong field 'score' in request data")

        Rate.objects.create(score=score,
                            user=user.userprofile,
                            year=current_year,
                            version=settings.VERSION)

        return HttpResponse()
