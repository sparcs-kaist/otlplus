from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, patch_object

from .models import BasicGraduationRequirement, MajorGraduationRequirement, Planner


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
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        # TODO: correct way to get entrance_year?
        entrance_year = int(userprofile.student_id[:4])
        planner = Planner.objects.create(user=userprofile, entrance_year=entrance_year) # TODO: add arrange_order

        # TODO: use get_object_or_404 instead of objects.get?
        basic_graduation_requirement = BasicGraduationRequirement.objects.get(entrance_year=entrance_year)
        planner.basic_graduation_requirement.add(basic_graduation_requirement)

        # TODO: correct way to get majors?
        for i, major in enumerate(userprofile.majors):
            try:
                if i == 0:
                    major_graduation_requirement = MajorGraduationRequirement.objects.get(
                        entrance_year=entrance_year,
                        department=major,
                        major_type=MajorGraduationRequirement.MajorType.MAJOR
                    )
                else:
                    major_graduation_requirement = MajorGraduationRequirement.objects.get(
                        entrance_year=entrance_year,
                        department=major,
                        major_type=MajorGraduationRequirement.MajorType.DOUBLE_MAJOR
                    )
            except MajorGraduationRequirement.DoesNotExist:
                return HttpResponseBadRequest("Invalid MajorGraduationRequirement information in request data")
            planner.major_graduation_requirements.add(major_graduation_requirement)
        
        for i, major in enumerate(userprofile.minors):
            try:
                major_graduation_requirement = MajorGraduationRequirement.objects.get(
                    entrance_year=entrance_year,
                    department=major,
                    major_type=MajorGraduationRequirement.MajorType.MINOR
                )
            except MajorGraduationRequirement.DoesNotExist:
                return HttpResponseBadRequest("Invalid MajorGraduationRequirement information in request data")
            planner.major_graduation_requirements.add(major_graduation_requirement)
        
        for i, major in enumerate(userprofile.specialized_major):
            try:
                major_graduation_requirement = MajorGraduationRequirement.objects.get(
                    entrance_year=entrance_year,
                    department=major,
                    major_type=MajorGraduationRequirement.MajorType.SPECIALIZED_MAJOR
                )
            except MajorGraduationRequirement.DoesNotExist:
                return HttpResponseBadRequest("Invalid MajorGraduationRequirement information in request data")
            planner.major_graduation_requirements.add(major_graduation_requirement)

        # TODO: major_graduation_requirements for self designed major?

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
            ("entrance_year", ParseType.INT, True, [lambda entrance_year: 1900 <= entrance_year <= 9999]), # TODO: change range to entrance_year ~ current year
            # TODO: add correct validators (list of existing majors, major types)
            ("major", ParseType.STR, True, []),
            ("additional_majors", ParseType.LIST_STR, True, []),
            ("additional_major_types", ParseType.LIST_STR, True, []),
        ]

        entrance_year, major, additional_majors, additional_major_types = parse_body(request.body, BODY_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        planner = get_object_or_404(Planner, id=planner_id)

        # TODO: use get_object_or_404 instead of objects.get?
        basic_graduation_requirement = BasicGraduationRequirement.objects.get(entrance_year=entrance_year)
        major_graduation_requirements = [
            MajorGraduationRequirement.objects.get(
                entrance_year=entrance_year,
                department=major,
                major_type=MajorGraduationRequirement.MajorType.MAJOR
            ),
        ]

        for i, major in enumerate(additional_majors):
            try:
                major_graduation_requirement = MajorGraduationRequirement.objects.get(
                    entrance_year=entrance_year,
                    department=major,
                    major_type=additional_major_types[i]
                )
            except MajorGraduationRequirement.DoesNotExist:
                return HttpResponseBadRequest("Invalid MajorGraduationRequirement information in request data")
            major_graduation_requirements.add(major_graduation_requirement)


        patch_object(
            planner,
            {
                "entrance_year": entrance_year,
                "basic_graduation_requirement": basic_graduation_requirement,
                "major_graduation_requirements": major_graduation_requirements,
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

        # TODO: add arrange_order

        return HttpResponse()


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
