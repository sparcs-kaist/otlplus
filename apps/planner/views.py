import json

from django.db.models import F
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View
from django.db import transaction

from .models import Planner, TakenPlannerItem, FuturePlannerItem, GenericPlannerItem
from apps.subject.models import Course, Lecture
from apps.graduation.models import GeneralTrack, MajorTrack, AdditionalTrack
from .services import reorder_planner

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
            ("general_track", ParseType.INT, True, []),
            ("major_track", ParseType.INT, True, []),
            ("additional_tracks", ParseType.LIST_INT, False, []),
            ("should_update_taken_semesters", ParseType.BOOL, False, []),
            ("taken_items", ParseType.LIST_INT, True, []),
            ("future_items", ParseType.LIST_INT, True, []),
            ("generic_items", ParseType.LIST_INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        start_year, end_year,\
        general_track, major_track, additional_tracks,\
        should_update_taken_semesters, taken_items, future_items, generic_items\
            = parse_body(request.body, BODY_STRUCTURE)

        related_planners = Planner.get_related_planners(userprofile)
        if related_planners.exists():
            arrange_order = related_planners.order_by("arrange_order").last().arrange_order + 1
        else:
            arrange_order = 0

        planner = Planner.objects.create(user=userprofile, start_year=start_year, end_year=end_year,
                                         general_track=GeneralTrack.objects.get(id=general_track),
                                         major_track=MajorTrack.objects.get(id=major_track),
                                         arrange_order=arrange_order)
    
        for at in additional_tracks:
            planner.additional_tracks.add(AdditionalTrack.objects.get(id=at))

        if should_update_taken_semesters:
            taken_lectures = userprofile.review_writable_lectures.filter(year__gte=start_year, year__lte=end_year)
            for l in taken_lectures:
                TakenPlannerItem.objects.create(planner=planner, lecture=l)

        for i in taken_items:
            try:
                target_item = TakenPlannerItem.objects.get(planner__user=userprofile, id=i)
            except TakenPlannerItem.DoesNotExist:
                HttpResponseBadRequest("No such planner item")
            TakenPlannerItem.objects.create(planner=planner,
                                            lecture=target_item.lecture)
        for i in future_items:
            try:
                target_item = FuturePlannerItem.objects.get(planner__user=userprofile, id=i)
            except FuturePlannerItem.DoesNotExist:
                HttpResponseBadRequest("No such planner item")
            FuturePlannerItem.objects.create(planner=planner,
                                             year=target_item.year, semester=target_item.semester,
                                             course=target_item.course)
        for i in generic_items:
            try:
                target_item = GenericPlannerItem.objects.get(planner__user=userprofile, id=i)
            except GenericPlannerItem.DoesNotExist:
                HttpResponseBadRequest("No such planner item")
            GenericPlannerItem.objects.create(planner=planner,
                                              year=target_item.year, semester=target_item.semester,)

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
            ("start_year", ParseType.INT, False, []),
            ("general_track", ParseType.INT, False, []),
            ("major_track", ParseType.INT, False, []),
            ("additional_tracks", ParseType.LIST_INT, False, []),
        ]

        start_year, general_track, major_track, additional_tracks = parse_body(request.body, BODY_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        planner = get_object_or_404(Planner, id=planner_id)

        patch_object(
            planner,
            {
                "general_track": GeneralTrack.objects.get(id=general_track),
                "major_track": MajorTrack.objects.get(id=major_track),
                "additional_tracks": [AdditionalTrack.objects.get(id=at) for at in additional_tracks],
            },
        )
        return JsonResponse(planner.to_json(), safe=False)

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


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceAddItemView(View):
    def post(self, request, user_id, planner_id):
        BODY_STRUCTURE = [
            ("type", ParseType.STR, True, []),
            ("course", ParseType.INT, True, []),
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        type_, course, year, semester = parse_body(request.body, BODY_STRUCTURE)

        if type_ == 'FUTURE':
            try:
                course = Course.objects.get(id=course)
            except Course.DoesNotExist:
                return HttpResponseBadRequest("Wrong field 'course' in request data")
            item = FuturePlannerItem.objects.create(planner=planner, year=year, semester=semester,
                                                    course=course)
        return JsonResponse(item.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceRemoveItemView(View):
    def post(self, request, user_id, planner_id):
        BODY_STRUCTURE = [
            ("item", ParseType.INT, True, []),
            ("type", ParseType.STR, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        item, type_ = parse_body(request.body, BODY_STRUCTURE)

        if type_ == 'TAKEN':
            return HttpResponseBadRequest("Planner item with type 'taken' can't be deleted")
        if type_ == 'FUTURE':
            try:
                target_item = FuturePlannerItem.objects.get(planner=planner, id=item)
            except FuturePlannerItem.DoesNotExist:
                HttpResponseBadRequest("No such planner item")
            target_item.delete()

        return JsonResponse(planner.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceReorderView(View):
    def post(self, request, user_id, planner_id):
        BODY_STRUCTURE = [
            ("arrange_order", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        arrange_order, = parse_body(request.body, BODY_STRUCTURE)

        reorder_planner(planner, arrange_order)
        return JsonResponse(planner.to_json())
