from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

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
        return JsonResponse()
