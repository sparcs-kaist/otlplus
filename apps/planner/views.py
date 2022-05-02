from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.views import View

from .models import Planner, PlannerItem

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_body


@method_decorator(login_required_ajax, name="dispatch")
class UserInstancePlannerInstanceAddPlannerItemView(View):
    def post(self, request, user_id, planner_id):
        return JsonResponse()

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
