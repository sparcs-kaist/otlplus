from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.http import HttpResponseBadRequest

from utils.decorators import login_required_ajax

from .models import Semester, Course, Lecture, Professor, CourseUser
from apps.session.models import UserProfile
from apps.review.models import Review
from utils.util import rgetattr, getint, get_paginated_queryset

import datetime


@require_http_methods(['GET'])
def semester_list_view(request):
    if request.method == 'GET':
        semesters = Semester.objects.all().order_by('year', 'semester')

        result = [s.toJson() for s in semesters]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def course_list_view(request):
    MAX_LIMIT = 150

    if request.method == 'GET':
        courses = Course.objects.all().order_by('old_code')

        department = request.GET.getlist('department', [])
        courses = _filterDepartment(courses, department)

        type_ = request.GET.getlist('type', [])
        courses = _filterType(courses, type_)

        level = request.GET.getlist('grade', [])
        courses = _filterLevel(courses, level)

        term = request.GET.get('term', None)
        courses = _filterTerm(courses, term)

        group = request.GET.getlist('group', [])
        courses = _filterGroup(courses, group)

        keyword = request.GET.get('keyword', '').strip()
        courses = _filterKeyword(courses, keyword)

        courses = courses \
            .distinct() \
            #.select_related('department') \
            #.prefetch_related('related_courses_prior', 'related_courses_posterior', 'professors', 'read_users_courseuser')

        offset = getint(request.GET, 'offset', None)
        limit = getint(request.GET, 'limit', None)
        courses = get_paginated_queryset(courses, offset, limit, MAX_LIMIT)

        result = [c.toJson(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def course_instance_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)

        result = course.toJson(user=request.user)
        return JsonResponse(result)


@require_http_methods(['GET'])
def course_list_autocomplete_view(request):
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
def course_instance_reviews_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        reviews = course.reviews.all().order_by('-lecture__year','-written_datetime')

        reviews = reviews[:100]
        result = [r.toJson(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def course_instance_lectures_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        lectures = course.lectures.filter(deleted=False).order_by('year','semester', 'class_no')

        result = [l.toJson() for l in lectures]
        return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(['POST'])
def course_instance_read_view(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    if request.method == 'POST':
        user = request.user
        user_profile = user.userprofile

        try:
            course_user = CourseUser.objects.get(user_profile=user_profile, course=course)
            course_user.save()
        except CourseUser.DoesNotExist:
            CourseUser.objects.create(user_profile=user_profile, course=course)
        return HttpResponse()


@require_http_methods(['GET'])
def lecture_list_view(request):
    MAX_LIMIT = 300

    if request.method == 'GET':
        lectures = Lecture.objects \
            .filter(deleted=False) \
            .exclude(Lecture.getQueryResearch())

        year = request.GET.get('year', None)
        semester = request.GET.get('semester', None)
        lectures = _filterYearSemester(lectures, year, semester)

        department = request.GET.getlist('department', [])
        lectures = _filterDepartment(lectures, department)

        type_ = request.GET.getlist('type', [])
        lectures = _filterType(lectures, type_)

        level = request.GET.getlist('grade', [])
        lectures = _filterLevel(lectures, level)

        day = request.GET.get('day', None)
        begin = request.GET.get('begin', None)
        end = request.GET.get('end', None)
        lectures = _filterTime(lectures, day, begin, end)

        keyword = request.GET.get('keyword', '').strip()
        lectures = _filterKeyword(lectures, keyword)

        group = request.GET.getlist('group', [])
        lectures = _filterGroup(lectures, group)

        lectures = lectures \
            .distinct() \
            .order_by('old_code', 'class_no')
            #.select_related('course', 'department') \
            #.prefetch_related('classtimes', 'examtimes', 'professors') \

        offset = getint(request.GET, 'offset', None)
        limit = getint(request.GET, 'limit', None)
        lectures = get_paginated_queryset(lectures, offset, limit, MAX_LIMIT)
    
        result = [l.toJson(nested=False) for l in lectures]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lecture_instance_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)

        result = lecture.toJson()
        return JsonResponse(result)


@require_http_methods(['GET'])
def lecture_list_autocomplete_view(request):
    if request.method == 'GET':
        try:
            year = request.GET['year']
            semester = request.GET['semester']
            keyword = request.GET['keyword']
        except KeyError:
            return HttpResponseBadRequest('Missing fields in request data')

        lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)
        professors = Professor.objects.filter(lectures__deleted=False, lectures__year=year, lectures__semester=semester)

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
def lecture_instance_reviews_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = lecture.reviews.all().order_by('-id')

        result = [r.toJson() for r in reviews]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lecture_instance_related_reviews_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = Review.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        ).order_by('-id')

        result = [r.toJson() for r in reviews]
        return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(['GET'])
def user_instance_taken_courses_view(request, user_id):
    if request.method == 'GET':
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lectures__in=userprofile.taken_lectures.all()).order_by('old_code').distinct()

        result = [c.toJson(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)



def _filterDepartment(queryset, department):
    if not (department and len(department)):
        return queryset

    major_list = ["CE", "MSB", "ME", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS",
                    "MS", "NQE", "HSS", "EE", "CS", "AE", "CH", "TS"]
    if 'ALL' in department:
        return queryset
    elif 'ETC' in department:
        return queryset.exclude(department__code__in = set(major_list) - set(department))
    else:
        return queryset.filter(department__code__in = department)


def _filterType(queryset, type_):
    if not (type_ and len(type_)):
        return queryset

    acronym_dic = {'GR': 'General Required', 'MGC': 'Mandatory General Courses', 'BE': 'Basic Elective',
                    'BR': 'Basic Required', 'EG': 'Elective(Graduate)', 'HSE': 'Humanities & Social Elective',
                    'OE': 'Other Elective', 'ME': 'Major Elective', 'MR': 'Major Required'}
    if 'ALL' in type_:
        return queryset
    elif 'ETC' in type_:
        return queryset.exclude(type_en__in = [acronym_dic[x] for x in acronym_dic if x not in type_])
    else:
        return queryset.filter(type_en__in = [acronym_dic[x] for x in acronym_dic if x in type_])


def _filterLevel(queryset, level):
    if not (level and len(level)):
        return queryset

    acronym_dic = {'100':"1", '200':"2", '300':"3", '400':"4"}
    if "ALL" in level:
        return queryset
    elif "ETC" in level:
        numbers = ''.join([acronym_dic[x] for x in acronym_dic if x not in level])
        regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
        return queryset.exclude(old_code__regex=regex)
    else:
        numbers = ''.join([acronym_dic[x] for x in acronym_dic if x in level])
        regex = r'^[A-Za-z]+[{numbers}][0-9][0-9]$'.format(numbers=numbers)
        return queryset.filter(old_code__regex=regex)


def _filterTerm(queryset, term):
    if not (term and len(term)):
        return queryset

    if "ALL" in term:
        return queryset
    else:
        current_year = datetime.datetime.now().year
        return queryset.filter(lectures__year__gte=current_year-int(term))


def _filterGroup(queryset, group):
    if not (group and len(group)):
        return queryset

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
    return queryset.filter(query)


def _filterKeyword(queryset, keyword):
    if not (keyword and len(keyword)):
        return queryset
    
    return queryset.filter(
        Q(title__icontains=keyword) |
        Q(title_en__icontains=keyword) |
        Q(old_code__iexact=keyword) |
        Q(department__name__iexact=keyword) |
        Q(department__name_en__iexact=keyword) |
        Q(professors__professor_name__icontains=keyword) |
        Q(professors__professor_name_en__icontains=keyword)
    )


def _filterTime(queryset, day, begin, end):
    time_query = Q()
    if day:
        time_query &= Q(classtimes__day = day)
    if begin:
        time_query &= Q(classtimes__begin__gte = datetime.time(int(begin)/2+8, (int(begin)%2)*30))
    if end and (int(end) != 32):
        time_query &= Q(classtimes__end__lte = datetime.time(int(end)/2+8, (int(end)%2)*30))
    return queryset.filter(time_query)


def _filterYearSemester(queryset, year, semester):
    if year:
        queryset = queryset.filter(year=year)
    if semester:
        queryset = queryset.filter(semester=semester)
    return queryset
