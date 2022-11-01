from django.db import transaction
from django.db.models import F
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

from apps.subject.models import Department

from .models import Planner, PlannerItem, Course
from .services import reorder_planner

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, patch_object



@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerListView(View):
    def get(self, request, user_id):
        MAX_LIMIT = 50
        DEFAULT_ORDER = ['arrange_order', 'id']
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
            ("entrance_year", ParseType.INT, True, []),
            ("track", ParseType.LIST_STR, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        entrance_year, track, = parse_body(request.body, BODY_STRUCTURE)

        related_planners = Planner.get_related_planners(userprofile, entrance_year, track)
        if related_planners.exists():
            arrange_order = related_planners.order_by("arrange_order").last().arrange_order + 1
        else:
            arrange_order = 0
        
        planner = Planner.objects.create(user=userprofile, entrance_year=entrance_year, track=track,
                                         arrange_order=arrange_order)

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
            ("entrance_year", ParseType.INT, True, []),
            ("track", ParseType.LIST_STR, True, []),
        ]

        entrance_year, track, = parse_body(request.body, BODY_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            planner = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        patch_object(
            planner,
            {
                "entrance_year": entrance_year,
                "track": track,
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
        related_planners = Planner.get_related_planners(userprofile,
                                                        planner.entrance_year, planner.track)
        related_planners.filter(arrange_order__gt=planner.arrange_order) \
                        .update(arrange_order=F('arrange_order')-1)

        return HttpResponse()


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstancePlannerItemView(View):
    def get(self, request, user_id, planner_id, planner_item_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        try:
            plannerItem = PlannerItem.objects.get(id=planner_item_id)
        except PlannerItem.DoesNotExist:
            return HttpResponseNotFound()

        if not plannerItem.planner == Planner.objects.get(planner_id):
            return HttpResponseBadRequest()

        return JsonResponse(plannerItem.to_json())

    def patch(self, request, user_id, planner_id, planner_item_id):
        BODY_STRUCTURE = [
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
            ("is_generic", ParseType.STR, True, [lambda is_generic: is_generic == "true" or is_generic == "false"]),
            ("course_id", ParseType.STR, False, []),
            ("course_type", ParseType.STR, False, []),
            ("department_id", ParseType.STR, False, []),
            ("credit", ParseType.INT, False, []),
        ]
        
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        try:
            plannerItem = PlannerItem.objects.get(id=planner_item_id)
        except PlannerItem.DoesNotExist:
            return HttpResponseNotFound()

        if not plannerItem.planner == Planner.objects.get(planner_id):
            return HttpResponseBadRequest()
        
        year, semester, is_generic, course_id, course_type, department_id, credit, = parse_body(request.body, BODY_STRUCTURE)
        if (is_generic == "false" and course_id == None) or (is_generic == "true" and (course_type == None or credit == None)):
            return HttpResponseBadRequest()
        if is_generic == "true":
            try:
                Course.objects.get(id=course_id)
                Department.objects.get(id=department_id)
            except (Course.DoesNotExist, Department.DoesNotExist):
                return HttpResponseBadRequest()
        
        patch_object(
            plannerItem,
            {
                "year": year,
                "semester": semester,
                "is_generic": is_generic == "true",
                "course_id": course_id,
                "course_type": course_type,
                "department_id": department_id,
                "credit": credit,
            },
        )

        return JsonResponse(plannerItem.to_json())
    
    def delete(self, request, user_id, planner_id, planner_item_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        try:
            plannerItem = PlannerItem.objects.get(id=planner_item_id)
        except PlannerItem.DoesNotExist:
            return HttpResponseNotFound()

        if not plannerItem.planner == Planner.objects.get(planner_id):
            return HttpResponseBadRequest()

        plannerItem.delete()
        
        return HttpResponse()


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceAddPlannerItemView(View):
    def post(self, request, user_id, planner_id):
        BODY_STRUCTURE = [
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
            ("is_generic", ParseType.STR, True, [lambda is_generic: is_generic == "true" or is_generic == "false"]),
            ("course_id", ParseType.STR, False, []),
            ("course_type", ParseType.STR, False, []),
            ("department_id", ParseType.STR, False, []),
            ("credit", ParseType.INT, False, []),
        ]
        
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        year, semester, is_generic, course_id, course_type, department_id, credit, = parse_body(request.body, BODY_STRUCTURE)
        if (is_generic == "false" and course_id == None) or (is_generic == "true" and (course_type == None or credit == None)):
            return HttpResponseBadRequest()
        if is_generic == "true":
            try:
                Course.objects.get(id=course_id)
                Department.objects.get(id=department_id)
            except (Course.DoesNotExist, Department.DoesNotExist):
                return HttpResponseBadRequest()
        
        plannerItem = PlannerItem(planner_id, year, semester, is_generic == "true", course_id, course_type, department_id, credit)
        plannerItem.save()

        return HttpResponse()


# TODO: check UserInstancePlannerInstanceApplyHistoryView class
@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceApplyHistoryView(View):
    def patch(self, request, user_id, planner_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = userprofile.planners.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        takenLectures = userprofile.taken_lectures
        lastYear, lastSemester = 0, 0
        plannerItems = []
        
        for lecture in takenLectures:
            if lecture.year > lastYear:
                lastYear = lecture.year
                lastSemester = lecture.semester
            elif lecture.year == lastYear and lecture.semester > lastSemester:
                lastSemester = lecture.semester
            plannerItem = PlannerItem(planner_id, lecture.year, lecture.semester, False, lecture.course, None, None, None)
            plannerItems.append(plannerItem)
        
        try:
            with transaction.atomic():
                PlannerItem.objects.filter(year__lte=lastYear).filter(semester__lte=lastSemester).delete()
                PlannerItem.objects.bulk_create(plannerItems)
        except:
            return HttpResponse(status=500)
        
        return HttpResponse(status=200)


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
            planner = Planner.objects.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()

        arrange_order, = parse_body(request.body, BODY_STRUCTURE)

        reorder_planner(planner, arrange_order)
        return JsonResponse(planner.to_json())