import json

from django.conf import settings
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, apply_order

from .models import Notice, Rate


class NoticeListView(View):
    def get(self, request):
        DEFAULT_ORDER = ['start_time', 'id']
        PARAMS_STRUCTURE = [
            ("time", ParseType.STR, False, []),
            ORDER_DEFAULT_CONFIG,
        ]

        time, order = parse_params(request.GET, PARAMS_STRUCTURE)

        notices = Notice.objects.all()

        if time:
            notices = notices.filter(start_time__lte=time, end_time__gte=time)

        notices = apply_order(notices, order, DEFAULT_ORDER)
        result = [n.to_json() for n in notices]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class RateListView(View):
    def post(self, request):
        BODY_STRUCTURE = [
            ("score", ParseType.INT, True, [lambda score: 1 <= score <= 5]),
        ]

        score, = parse_body(request.body, BODY_STRUCTURE)

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)

        current_year = timezone.now().year
        if Rate.objects.filter(user=user.userprofile, year=current_year).exists():
            return HttpResponseBadRequest("You already rated for current year")

        Rate.objects.create(score=score,
                            user=user.userprofile,
                            year=current_year,
                            version=settings.VERSION)

        return HttpResponse()
