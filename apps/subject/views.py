from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q

from models import Course

# Create your views here.

@require_http_methods(['GET'])
def courses_list_view(request):
    if request.method == 'GET':
        courses = Course.objects.all().order_by('old_code')

        group = request.GET.getlist('group', [])
        if group and len(group):
            query = Q()
            if 'Basic' in group:
                group.remove('Basic')
                filter_type = ['Basic Required', 'Basic Elective']
                query |= Q(type_en__in=filter_type)
            if 'Humanity' in group:
                group.remove('Humanity')
                query |= Q(type_en='Humanities & Social Elective')
            if len(group):
                filter_type = ['Major Required', 'Major Elective', 'Elective(Graduate)']
                query |= Q(type_en__in=filter_type, department__code__in=group)
            courses = courses.filter(query)

        courses = courses[:300]
        result = [c.toJson() for c in courses]
        return JsonResponse(result, safe=False)
