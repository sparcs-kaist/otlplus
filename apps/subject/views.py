from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.http import HttpResponseBadRequest

from utils.decorators import login_required_ajax

from models import Semester, Course, Lecture
from apps.session.models import UserProfile
from apps.review.models import Comment
from apps.timetable.views import _lecture_result_format

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
                courses = courses.exclude(code_num__in = [acronym_dic[x] for x in acronym_dic if x not in level])
            else:
                courses = courses.filter(code_num__in = [acronym_dic[x] for x in acronym_dic if x in level])

        term = request.GET.get('term', None)
        if term and len(term):
            if "ALL" in term:
                pass
            else:
                current_year = datetime.datetime.now().year
                print(current_year-int(term))
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

        keyword = request.GET.get('keyword', None)
        if keyword:
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
            .select_related('department') \
            .prefetch_related('related_courses_prior', 'related_courses_posterior', 'professors', 'read_users_courseuser')
        result = [c.toJson(user=request.user) for c in courses[:300]]
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

        courses_filtered = courses.filter(department__name__istartswith=keyword).order_by('department__name')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].department.name, safe=False)

        courses_filtered = courses.filter(department__name_en__istartswith=keyword).order_by('department__name_en')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].department.name_en, safe=False)

        courses_filtered = courses.filter(title__istartswith=keyword).order_by('title')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].title, safe=False)

        courses_filtered = courses.filter(title_en__istartswith=keyword).order_by('title_en')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].title_en, safe=False)

        courses_filtered = courses.filter(professors__professor_name__istartswith=keyword).order_by('professors__professor_name')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].professors.filter(professor_name__istartswith=keyword)[0].professor_name, safe=False)

        courses_filtered = courses.filter(professors__professor_name_en__istartswith=keyword).order_by('professors__professor_name_en')
        if courses_filtered.exists():
            return JsonResponse(courses_filtered[0].professors.filter(professor_name_en__istartswith=keyword)[0].professor_name_en, safe=False)

        return JsonResponse(keyword, safe=False)


@require_http_methods(['GET'])
def courses_instance_comments_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        comments = course.comment_set.all().order_by('-lecture__year','-written_datetime')

        result = [c.toJson(user=request.user) for c in comments]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def courses_instance_lectures_view(request, course_id):
    if request.method == 'GET':
        course = get_object_or_404(Course, id=course_id)
        lectures = course.lecture_course.all().order_by('year','semester', 'class_no')

        result = [l.toJson() for l in lectures]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lectures_list_view(request):
    if request.method == 'GET':
        lectures = Lecture.objects \
            .filter(deleted=False) \
            .exclude(type_en__in=['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'])

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
                lectures = lectures.exclude(course__code_num__in = [acronym_dic[x] for x in acronym_dic if x not in level])
            else:
                lectures = lectures.filter(course__code_num__in = [acronym_dic[x] for x in acronym_dic if x in level])

        time_query = Q()

        day = request.GET.get('day', None)
        if day:
            time_query &= Q(classtime_set__day = day)

        begin = request.GET.get('begin', None)
        if begin:
            print(begin)
            time_query &= Q(classtime_set__begin__gte = datetime.time(int(begin)/2+8, (int(begin)%2)*30))

        end = request.GET.get('end', None)
        if end and False:
            print(end)
            if int(end) == 32:
                pass
            else:
                time_query &= Q(classtime_set__end__lte = datetime.time(int(end)/2+8, (int(end)%2)*30))

        lectures = lectures.filter(time_query)

        keyword = request.GET.get('keyword', None)
        if keyword:
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

        lectures = lectures.distinct()
        result = _lecture_result_format(lectures, from_search = True)
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

        lectures_filtered = lectures.filter(department__name__istartswith=keyword).order_by('department__name')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].department.name, safe=False)

        lectures_filtered = lectures.filter(department__name_en__istartswith=keyword).order_by('department__name_en')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].department.name_en, safe=False)

        lectures_filtered = lectures.filter(title__istartswith=keyword).order_by('title')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].title, safe=False)

        lectures_filtered = lectures.filter(title_en__istartswith=keyword).order_by('title_en')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].title_en, safe=False)

        lectures_filtered = lectures.filter(professors__professor_name__istartswith=keyword).order_by('professor__professor_name')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].professors.filter(professor_name__istartswith=keyword)[0].professor_name, safe=False)

        lectures_filtered = lectures.filter(professors__professor_name_en__istartswith=keyword).order_by('professor__professor_name_en')
        if lectures_filtered.exists():
            return JsonResponse(lectures_filtered[0].professors.filter(professor_name_en__istartswith=keyword)[0].professor_name_en, safe=False)

        return JsonResponse(keyword, safe=False)


@require_http_methods(['GET'])
def lectures_instance_comments_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        comments = lecture.comment_set.all().order_by('-id')

        result = [c.toJson() for c in comments]
        return JsonResponse(result, safe=False)


@require_http_methods(['GET'])
def lectures_instance_related_comments_view(request, lecture_id):
    if request.method == 'GET':
        lecture = get_object_or_404(Lecture, id=lecture_id)
        comments = Comment.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        ).order_by('-id')

        result = [c.toJson() for c in comments]
        return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(['GET'])
def users_instance_taken_courses_view(request, user_id):
    if request.method == 'GET':
        userprofile = UserProfile.objects.get(user=request.user)
        print(userprofile.id)
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lecture_course__in=userprofile.take_lecture_list.all()).order_by('old_code').distinct()

        result = [c.toJson(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)
