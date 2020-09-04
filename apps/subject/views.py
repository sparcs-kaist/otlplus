from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.http import HttpResponseBadRequest

from utils.decorators import login_required_ajax

from models import Semester, Course, Lecture, Professor
from apps.session.models import UserProfile
from apps.review.models import Review
from apps.common.util import rgetattr

import datetime


@require_http_methods(['GET'])
def semesters_list_view(request):
    if request.method == 'GET':
        semesters = Semester.objects.all().order_by('year', 'semester')

        result = [s.toJson() for s in semesters]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def courses_list_view(request):
    if request.method == 'GET':
        courses = Course.objects.all().order_by('old_code')

        department = request.GET.getlist('department', [])
        if department and len(department):
            major_list = ["CE", "MSB", "ME", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                          "MS", "NQE", "HSS", "EE", "CS", "AE", "CH"]
            if 'ALL' in department:
                pass
            elif 'ETC' in department:
                courses = courses.exclude(department__code__in = set(major_list) - set(department))
            else:
                courses = courses.filter(department__code__in = department)

        type_ = request.GET.getlist('type', [])
        if type_ and len(type_):
            acronym_dic = {'GR': 'General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
                           'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
                           'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required'}
            if 'ALL' in type_:
                pass
            elif 'ETC' in type_:
                courses = courses.exclude(type_en__in = [acronym_dic[x] for x in acronym_dic if x not in type_])
            else:
                courses = courses.filter(type_en__in = [acronym_dic[x] for x in acronym_dic if x in type_])

        level = request.GET.getlist('grade', [])
        if level and len(level):
            acronym_dic = {'100':"1", '200':"2", '300':"3", '400':"4"}
            if "ALL" in level:
                pass
            elif "ETC" in level:
                numbers = ''.join([acronym_dic[x] for x in acronym_dic if x not in level])
                regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
                courses = courses.exclude(old_code__regex=regex)
            else:
                numbers = ''.join([acronym_dic[x] for x in acronym_dic if x in level])
                regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
                print(regex)
                courses = courses.filter(old_code__regex=regex)

        term = request.GET.get('term', None)
        if term and len(term):
            if "ALL" in term:
                pass
            else:
                current_year = datetime.datetime.now().year
                courses = courses.filter(lecture_course__year__gte=current_year-int(term))

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

        keyword = request.GET.get('keyword', '').strip()
        if keyword and len(keyword):
            courses = courses.filter(
                Q(title__icontains=keyword) |
                Q(title_en__icontains=keyword) |
                Q(old_code__iexact=keyword) |
                Q(department__name__iexact=keyword) |
                Q(department__name_en__iexact=keyword) |
                Q(professors__professor_name__icontains=keyword) |
                Q(professors__professor_name_en__icontains=keyword)
            )

        courses = courses \
            .distinct() \
            #.select_related('department') \
            #.prefetch_related('related_courses_prior', 'related_courses_posterior', 'professors', 'read_users_courseuser')
        result = [c.toJson(user=request.user) for c in courses[:150]]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def courses_instance_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)

        result = course.toJson(user=request.user)
        return JsonResponse(result)


@require_http_methods(['GET'])
def courses_list_autocomplete_view(request):
    if request.method == 'GET':
        try:
            keyword = request.GET['keyword']
        except KeyError:
            return HttpResponseBadRequest('Missing fields in request data')

        courses = Course.objects.all().order_by('old_code')
        professors = Professor.objects.exclude(course_list=None).order_by('course_list__old_code')

        SEARCH_FIELDS = (
            {'queryset': courses, 'field': ('department', 'name')},
            {'queryset': courses, 'field': ('department', 'name_en')},
            {'queryset': courses, 'field': ('title', )},
            {'queryset': courses, 'field': ('title_en', )},
            {'queryset': professors, 'field': ('professor_name', )},
            {'queryset': professors, 'field': ('professor_name_en', )},
        )

        for f in SEARCH_FIELDS:
            field_name = '__'.join(f['field'])
            filtered = f['queryset'].filter(**{field_name+'__istartswith': keyword}).order_by(field_name)
            if filtered.exists():
                return JsonResponse(rgetattr(filtered[0], f['field'], keyword), safe=False)

        return JsonResponse(keyword, safe=False)


@require_http_methods(['GET'])
def courses_instance_reviews_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        reviews = course.reviews.all().order_by('-lecture__year','-written_datetime')

        reviews = reviews[:100]
        result = [c.toJson(user=request.user) for c in reviews]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def courses_instance_lectures_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        lectures = course.lecture_course.filter(deleted=False).order_by('year','semester', 'class_no')

        result = [l.toJson() for l in lectures]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lectures_list_view(request):
    if request.method == 'GET':
        lectures = Lecture.objects \
            .filter(deleted=False) \
            .exclude(Lecture.getQueryResearch())

        year = request.GET.get('year', None)
        if year:
            lectures = lectures.filter(year=year)

        semester = request.GET.get('semester', None)
        if semester:
            lectures = lectures.filter(semester=semester)

        department = request.GET.getlist('department', [])
        if department and len(department):
            major_list = ["CE", "MSB", "ME", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                          "MS", "NQE", "HSS", "EE", "CS", "AE", "CH"]
            if 'ALL' in department:
                pass
            elif 'ETC' in department:
                lectures = lectures.exclude(department__code__in = set(major_list) - set(department))
            else:
                lectures = lectures.filter(department__code__in = department)

        type_ = request.GET.getlist('type', [])
        if type_ and len(type_):
            acronym_dic = {'GR': 'General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
                           'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
                           'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required'}
            if 'ALL' in type_:
                pass
            elif 'ETC' in type_:
                lectures = lectures.exclude(type_en__in = [acronym_dic[x] for x in acronym_dic if x not in type_])
            else:
                lectures = lectures.filter(type_en__in = [acronym_dic[x] for x in acronym_dic if x in type_])

        level = request.GET.getlist('grade', [])
        if level and len(level):
            acronym_dic = {'100':"1", '200':"2", '300':"3", '400':"4"}
            if "ALL" in level:
                pass
            elif "ETC" in level:
                numbers = ''.join([acronym_dic[x] for x in acronym_dic if x not in level])
                regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
                lectures = lectures.exclude(old_code__regex=regex)
            else:
                numbers = ''.join([acronym_dic[x] for x in acronym_dic if x in level])
                regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
                lectures = lectures.filter(old_code__regex=regex)

        time_query = Q()

        day = request.GET.get('day', None)
        if day:
            time_query &= Q(classtime_set__day = day)

        begin = request.GET.get('begin', None)
        if begin:
            time_query &= Q(classtime_set__begin__gte = datetime.time(int(begin)/2+8, (int(begin)%2)*30))

        end = request.GET.get('end', None)
        if end:
            if int(end) == 32:
                pass
            else:
                time_query &= Q(classtime_set__end__lte = datetime.time(int(end)/2+8, (int(end)%2)*30))

        lectures = lectures.filter(time_query)

        keyword = request.GET.get('keyword', '').strip()
        if keyword and len(keyword):
            lectures = lectures.filter(
                Q(title__icontains=keyword) |
                Q(title_en__icontains=keyword) |
                Q(old_code__iexact=keyword) |
                Q(department__name__iexact=keyword) |
                Q(department__name_en__iexact=keyword) |
                Q(professors__professor_name__icontains=keyword) |
                Q(professors__professor_name_en__icontains=keyword)
            )

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
            lectures = lectures.filter(query)

        lectures = lectures \
            .distinct() \
            .order_by('old_code', 'class_no')
            #.select_related('course', 'department') \
            #.prefetch_related('classtime_set', 'examtime_set', 'professors') \
        result = [l.toJson(nested=False) for l in lectures[:300]]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lectures_instance_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)

        result = lecture.toJson()
        return JsonResponse(result)


@require_http_methods(['GET'])
def lectures_list_autocomplete_view(request):
    if request.method == 'GET':
        try:
            year = request.GET['year']
            semester = request.GET['semester']
            keyword = request.GET['keyword']
        except KeyError:
            return HttpResponseBadRequest('Missing fields in request data')

        lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)
        professors = Professor.objects.filter(lecture_professor__deleted=False, lecture_professor__year=year, lecture_professor__semester=semester)

        SEARCH_FIELDS = (
            {'queryset': lectures, 'field': ('department', 'name')},
            {'queryset': lectures, 'field': ('department', 'name_en')},
            {'queryset': lectures, 'field': ('title', )},
            {'queryset': lectures, 'field': ('title_en', )},
            {'queryset': professors, 'field': ('professor_name', )},
            {'queryset': professors, 'field': ('professor_name_en', )},
        )

        for f in SEARCH_FIELDS:
            field_name = '__'.join(f['field'])
            filtered = f['queryset'].filter(**{field_name+'__istartswith': keyword}).order_by(field_name)
            if filtered.exists():
                return JsonResponse(rgetattr(filtered[0], f['field'], keyword), safe=False)

        return JsonResponse(keyword, safe=False)


@require_http_methods(['GET'])
def lectures_instance_reviews_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = lecture.reviews.all().order_by('-id')

        result = [c.toJson() for c in reviews]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lectures_instance_related_reviews_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = Review.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        ).order_by('-id')

        result = [c.toJson() for c in reviews]
        return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(['GET'])
def users_instance_taken_courses_view(request, user_id):
    if request.method == 'GET':
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lecture_course__in=userprofile.take_lecture_list.all()).order_by('old_code').distinct()

        result = [c.toJson(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)
