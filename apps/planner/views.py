from django.http import JsonResponse, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views import View

from apps.subject.models import Department

from .models import Planner, PlannerItem, Course

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_body


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
            _ = Planner.objects.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        year, semester, is_generic, course_id, course_type, department_id, credit = parse_body(request.body, BODY_STRUCTURE)
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

@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstancePlannerItemView(View):
    def patch(self, request, user_id, planner_id, planner_item_id):
        return JsonResponse()
    
    def delete(self, request, user_id, planner_id, planner_item_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            _ = Planner.objects.get(id=planner_id)
        except Planner.DoesNotExist:
            return HttpResponseNotFound()
        
        try:
            plannerItem = PlannerItem.objects.get(id=planner_item_id)
        except PlannerItem.DoesNotExist:
            return HttpResponseNotFound()

        plannerItem.delete()
        return HttpResponse()
