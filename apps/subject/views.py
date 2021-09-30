from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParamsType, parse_params, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order


from apps.review.models import Review
from .models import Semester, Course, Lecture, Professor, CourseUser
from . import services


class SemesterListView(View):
    DEFAULT_ORDER = ['year', 'semester']

    def get(self, request):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)

        semesters = Semester.objects.all()

        semesters = apply_order(semesters, order, SemesterListView.DEFAULT_ORDER)
        result = [semester.to_json() for semester in semesters]
        return JsonResponse(result, safe=False)


class CourseListView(View):
    MAX_LIMIT = 150
    DEFAULT_ORDER = ['old_code']

    def get(self, request):
        department = parse_params(request.GET, ("department", ParamsType.LIST_STR, False, []))
        type_ = parse_params(request.GET, ("type", ParamsType.LIST_STR, False, []))
        level = parse_params(request.GET, ("level", ParamsType.LIST_STR, False, []))
        group = parse_params(request.GET, ("group", ParamsType.LIST_STR, False, []))
        keyword = parse_params(request.GET, ("keyword", ParamsType.STR, False, []))
        term = parse_params(request.GET, ("term", ParamsType.STR, False, []))
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

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

        courses = apply_order(courses, order, CourseListView.DEFAULT_ORDER)
        courses = apply_offset_and_limit(courses, offset, limit, CourseListView.MAX_LIMIT)
        result = [c.to_json(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)


class CourseInstanceView(View):
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        result = course.to_json(user=request.user)
        return JsonResponse(result)


class CourseListAutocompleteView(View):
    def get(self, request):
        keyword = parse_params(request.GET, ("keyword", ParamsType.STR, True, []))

        courses = Course.objects.all().order_by("old_code")
        professors = Professor.objects.exclude(course_list=None).order_by("course_list__old_code")

        match = services.match_autocomplete(keyword, courses, professors)
        if not match:
            return JsonResponse(keyword, safe=False)
        return JsonResponse(match, safe=False)


class CourseInstanceReviewsView(View):
    MAX_LIMIT = 100
    DEFAULT_ORDER = ['-lecture__year', '-lecture__semester', '-written_datetime', '-id']

    def get(self, request, course_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

        course = get_object_or_404(Course, id=course_id)
        reviews = course.reviews.all()

        reviews = apply_order(reviews, order, CourseInstanceReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit,
                                         CourseInstanceReviewsView.MAX_LIMIT)
        result = [review.to_json(user=request.user) for review in reviews]
        return JsonResponse(result, safe=False)


class CourseInstanceLecturesView(View):
    DEFAULT_ORDER = ['year', 'semester', 'class_no']

    def get(self, request, course_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)

        course = get_object_or_404(Course, id=course_id)
        lectures = course.lectures.filter(deleted=False)

        lectures = apply_order(lectures, order, CourseInstanceLecturesView.DEFAULT_ORDER)
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
    MAX_LIMIT = 300
    DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no']

    def get(self, request):
        year = parse_params(request.GET, ("year", ParamsType.INT, False, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, False, []))
        day = parse_params(request.GET, ("day", ParamsType.INT, False, []))
        begin = parse_params(request.GET, ("begin", ParamsType.INT, False, []))
        end = parse_params(request.GET, ("end", ParamsType.INT, False, []))
        department = parse_params(request.GET, ("department", ParamsType.LIST_STR, False, []))
        type_ = parse_params(request.GET, ("type", ParamsType.LIST_STR, False, []))
        level = parse_params(request.GET, ("level", ParamsType.LIST_STR, False, []))
        group = parse_params(request.GET, ("group", ParamsType.LIST_STR, False, []))
        keyword = parse_params(request.GET, ("keyword", ParamsType.STR, False, []))
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

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

        lectures = apply_order(lectures, order, LectureListView.DEFAULT_ORDER)
        lectures = apply_offset_and_limit(lectures, offset, limit, LectureListView.MAX_LIMIT)
        result = [lecture.to_json(nested=False) for lecture in lectures]
        return JsonResponse(result, safe=False)


class LectureInstanceView(View):
    def get(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        result = lecture.to_json()
        return JsonResponse(result)


class LectureListAutocompleteView(View):
    def get(self, request):
        year = parse_params(request.GET, ("year", ParamsType.INT, True, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, True, []))
        keyword = parse_params(request.GET, ("keyword", ParamsType.STR, True, []))

        lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)
        professors = Professor.objects.filter(lectures__deleted=False,
                                              lectures__year=year,
                                              lectures__semester=semester)

        match = services.match_autocomplete(keyword, lectures, professors)
        if not match:
            return JsonResponse(keyword, safe=False)
        return JsonResponse(match, safe=False)


class LectureInstanceReviewsView(View):
    MAX_LIMIT = 100
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request, lecture_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = lecture.reviews.all()

        reviews = apply_order(reviews, order, LectureInstanceReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit,
                                         LectureInstanceReviewsView.MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


class LectureInstanceRelatedReviewsView(View):
    MAX_LIMIT = 100
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request, lecture_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = Review.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        )

        reviews = apply_order(reviews, order, LectureInstanceRelatedReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit,
                                         LectureInstanceRelatedReviewsView.MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTakenCoursesView(View):
    DEFAULT_ORDER = ['old_code']

    def get(self, request, user_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lectures__in=userprofile.taken_lectures.all())

        courses = apply_order(courses, order, UserInstanceTakenCoursesView.DEFAULT_ORDER)
        result = [course.to_json(user=request.user) for course in courses]
        return JsonResponse(result, safe=False)
