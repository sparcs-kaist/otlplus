from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order


from apps.review.models import Review
from .models import Semester, Course, Lecture, Professor, CourseUser
from . import services


class SemesterListView(View):
    def get(self, request):
        DEFAULT_ORDER = ['year', 'semester']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
        ]

        order, = parse_params(request.GET, PARAMS_STRUCTURE)

        semesters = Semester.objects.all()

        semesters = apply_order(semesters, order, DEFAULT_ORDER)
        result = [semester.to_json() for semester in semesters]
        return JsonResponse(result, safe=False)


class CourseListView(View):
    def get(self, request):
        MAX_LIMIT = 150
        DEFAULT_ORDER = ['old_code']
        PARAMS_STRUCTURE = [
            ("department", ParseType.LIST_STR, False, []),
            ("type", ParseType.LIST_STR, False, []),
            ("level", ParseType.LIST_STR, False, []),
            ("group", ParseType.LIST_STR, False, []),
            ("keyword", ParseType.STR, False, []),
            ("term", ParseType.STR, False, []),
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        department, type_, level, group, keyword, \
        term, order, offset, limit = \
            parse_params(request.GET, PARAMS_STRUCTURE)

        courses = Course.objects.all()

        courses = services.filter_by_department(courses, department)
        courses = services.filter_by_type(courses, type_)
        courses = services.filter_by_level(courses, level)
        courses = services.filter_by_group(courses, group)
        courses = services.filter_by_keyword(courses, keyword)
        courses = services.filter_by_term(courses, term)

        courses = courses.distinct()
        # .select_related('department') \
        # .prefetch_related('related_courses_prior',
        #                   'related_courses_posterior',
        #                   'professors',
        #                   'read_users_courseuser')

        courses = apply_order(courses, order, DEFAULT_ORDER)
        courses = apply_offset_and_limit(courses, offset, limit, MAX_LIMIT)
        result = [c.to_json(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)


class CourseInstanceView(View):
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        result = course.to_json(user=request.user)
        return JsonResponse(result)


class CourseListAutocompleteView(View):
    def get(self, request):
        PARAMS_STRUCTURE = [
            ("keyword", ParseType.STR, True, [])
        ]

        keyword, = parse_params(request.GET, PARAMS_STRUCTURE)

        courses = Course.objects.all().order_by("old_code")
        professors = Professor.objects.exclude(course_list=None).order_by("course_list__old_code")

        match = services.match_autocomplete(keyword, courses, professors)
        if not match:
            return JsonResponse(keyword, safe=False)
        return JsonResponse(match, safe=False)


class CourseInstanceReviewsView(View):

    def get(self, request, course_id):
        MAX_LIMIT = 100
        DEFAULT_ORDER = ['-lecture__year', '-lecture__semester', '-written_datetime', '-id']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        course = get_object_or_404(Course, id=course_id)
        reviews = course.reviews.all()

        reviews = apply_order(reviews, order, DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, MAX_LIMIT)
        result = [review.to_json(user=request.user) for review in reviews]
        return JsonResponse(result, safe=False)


class CourseInstanceLecturesView(View):
    def get(self, request, course_id):
        DEFAULT_ORDER = ['year', 'semester', 'class_no']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
        ]

        order, = parse_params(request.GET, PARAMS_STRUCTURE)

        course = get_object_or_404(Course, id=course_id)
        lectures = course.lectures.filter(deleted=False)

        lectures = apply_order(lectures, order, DEFAULT_ORDER)
        result = [lecture.to_json() for lecture in lectures]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class CourseInstanceReadView(View):
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        profile = request.user.userprofile

        try:
            course_user = CourseUser.objects.get(user_profile=profile, course=course)
            course_user.save()
        except CourseUser.DoesNotExist:
            CourseUser.objects.create(user_profile=profile, course=course)
        return HttpResponse()


class LectureListView(View):
    def get(self, request):
        MAX_LIMIT = 300
        DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no']
        PARAMS_STRUCTURE = [
            ("year", ParseType.INT, False, []),
            ("semester", ParseType.INT, False, []),
            ("day", ParseType.INT, False, []),
            ("begin", ParseType.INT, False, []),
            ("end", ParseType.INT, False, []),
            ("department", ParseType.LIST_STR, False, []),
            ("type", ParseType.LIST_STR, False, []),
            ("level", ParseType.LIST_STR, False, []),
            ("group", ParseType.LIST_STR, False, []),
            ("keyword", ParseType.STR, False, []),
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        year, semester, day, begin, end, \
        department, type_, level, group, keyword, \
        order, offset, limit = \
            parse_params(request.GET, PARAMS_STRUCTURE)

        lectures = Lecture.objects.filter(deleted=False).exclude(Lecture.get_query_for_research())

        lectures = services.filter_by_semester(lectures, year, semester)
        lectures = services.filter_by_time(lectures, day, begin, end)
        lectures = services.filter_by_department(lectures, department)
        lectures = services.filter_by_type(lectures, type_)
        lectures = services.filter_by_level(lectures, level)
        lectures = services.filter_by_group(lectures, group)
        lectures = services.filter_by_keyword(lectures, keyword)

        # lectures = lectures
        # .select_related('course', 'department') \
        # .prefetch_related('classtimes', 'examtimes', 'professors') \

        lectures = apply_order(lectures, order, DEFAULT_ORDER)
        lectures = apply_offset_and_limit(lectures, offset, limit, MAX_LIMIT)
        result = [lecture.to_json(nested=False) for lecture in lectures]
        return JsonResponse(result, safe=False)


class LectureInstanceView(View):
    def get(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        result = lecture.to_json()
        return JsonResponse(result)


class LectureListAutocompleteView(View):
    def get(self, request):
        PARAMS_STRUCTURE = [
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
            ("keyword", ParseType.STR, True, []),
        ]

        year, semester, keyword = parse_params(request.GET, PARAMS_STRUCTURE)

        lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)
        professors = Professor.objects.filter(lectures__deleted=False,
                                              lectures__year=year,
                                              lectures__semester=semester)

        match = services.match_autocomplete(keyword, lectures, professors)
        if not match:
            return JsonResponse(keyword, safe=False)
        return JsonResponse(match, safe=False)


class LectureInstanceReviewsView(View):
    def get(self, request, lecture_id):
        MAX_LIMIT = 100
        DEFAULT_ORDER = ['-written_datetime', '-id']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = lecture.reviews.all()

        reviews = apply_order(reviews, order, DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


class LectureInstanceRelatedReviewsView(View):
    def get(self, request, lecture_id):
        MAX_LIMIT = 100
        DEFAULT_ORDER = ['-written_datetime', '-id']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = Review.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        )

        reviews = apply_order(reviews, order, DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTakenCoursesView(View):
    def get(self, request, user_id):
        DEFAULT_ORDER = ['old_code']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
        ]

        order, = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lectures__in=userprofile.taken_lectures.all())

        courses = apply_order(courses, order, DEFAULT_ORDER)
        result = [course.to_json(user=request.user) for course in courses]
        return JsonResponse(result, safe=False)
