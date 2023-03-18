import json

from django.db.models import F
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.db import transaction

from .models import Planner

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, patch_object


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerListView(View):
    def get(self, request, user_id):
        MAX_LIMIT = 50
        DEFAULT_ORDER = ['id']  # TODO: add arrange_order
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        planners = userprofile.planners.all()

        planners = apply_order(planners, order, DEFAULT_ORDER)
        planners = apply_offset_and_limit(planners, offset, limit, MAX_LIMIT)
        result = [p.to_json() for p in planners]
        return JsonResponse(result, safe=False)

    def post(self, request, user_id):
        BODY_STRUCTURE = [
            ("start_year", ParseType.INT, True, []),
            ("end_year", ParseType.INT, True, []),
            ("taken_items", ParseType.LIST_INT, True, []),
            ("future_items", ParseType.LIST_INT, True, []),
            ("generic_items", ParseType.LIST_INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        start_year, end_year, taken_items, future_items, generic_items = parse_body(request.body, BODY_STRUCTURE)

        related_timetables = Planner.get_related_planners(userprofile)
        if related_timetables.exists():
            arrange_order = related_timetables.order_by("arrange_order").last().arrange_order + 1
        else:
            arrange_order = 0

        planner = Planner.objects.create(user=userprofile, start_year=start_year, end_year=end_year,
                                         arrange_order=arrange_order)
        
        # TODO: Implement adding items

        return JsonResponse(planner.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceView(View):
    def get(self, request, user_id, planner_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        return JsonResponse(planner.to_json())

    def patch(self, request, user_id, planner_id):
        BODY_STRUCTURE = [
            ("start_year", ParseType.INT, True, []),
        ]

        start_year, = parse_body(request.body, BODY_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        planner = get_object_or_404(Planner, id=planner_id)

        patch_object(
            planner,
            {
                "start_year": start_year,
            },
        )
        return JsonResponse(planner.to_json(user=request.user), safe=False)

    def delete(self, request, user_id, planner_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        planner.delete()
        related_planners = Planner.get_related_planners(userprofile)
        related_planners.filter(arrange_order__gt=planner.arrange_order) \
                          .update(arrange_order=F('arrange_order')-1)
        return HttpResponse()
