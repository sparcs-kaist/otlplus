from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import apply_offset_and_limit, apply_order

from apps.review.models import Review
from .models import Semester, Course, Lecture, Professor, CourseUser
from . import services


class SemesterListView(View):
    DEFAULT_ORDER = ['year', 'semester']

    def get(self, request):
        semesters = Semester.objects.all()

        semesters = apply_order(semesters, request.GET, SemesterListView.DEFAULT_ORDER)
        result = [semester.to_json() for semester in semesters]
        return JsonResponse(result, safe=False)


class CourseListView(View):
    MAX_LIMIT = 150
    DEFAULT_ORDER = ['old_code']

    def get(self, request):
        courses = Course.objects.all()

        department = request.GET.getlist("department", [])
        courses = services.filter_by_department(courses, department)

        type_ = request.GET.getlist("type", [])
        courses = services.filter_by_type(courses, type_)

        level = request.GET.getlist("grade", [])
        courses = services.filter_by_level(courses, level)

        group = request.GET.getlist("group", [])
        courses = services.filter_by_group(courses, group)

        keyword = request.GET.get("keyword", "")
        courses = services.filter_by_keyword(courses, keyword)

        term = request.GET.get("term", None)
        courses = services.filter_by_term(courses, term)

        courses = courses.distinct()
        # .select_related('department') \
        # .prefetch_related('related_courses_prior',
        #                   'related_courses_posterior',
        #                   'professors',
        #                   'read_users_courseuser')

        courses = apply_order(courses, request.GET, CourseListView.DEFAULT_ORDER)
        courses = apply_offset_and_limit(courses, request.GET, CourseListView.MAX_LIMIT)
        result = [c.to_json(user=request.user) for c in courses]
        return JsonResponse(result, safe=False)


class CourseInstanceView(View):
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        result = course.to_json(user=request.user)
        return JsonResponse(result)


class CourseListAutocompleteView(View):
    def get(self, request):
        try:
            keyword = request.GET["keyword"]
        except KeyError:
            return HttpResponseBadRequest("Missing fields in request data")

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
        course = get_object_or_404(Course, id=course_id)
        reviews = course.reviews.all()

        reviews = apply_order(reviews, request.GET, CourseInstanceReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, request.GET, CourseInstanceReviewsView.MAX_LIMIT)
        result = [review.to_json(user=request.user) for review in reviews]
        return JsonResponse(result, safe=False)


class CourseInstanceLecturesView(View):
    DEFAULT_ORDER = ['year', 'semester', 'class_no']

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        lectures = course.lectures.filter(deleted=False)

        lectures = apply_order(lectures, request.GET, CourseInstanceLecturesView.DEFAULT_ORDER)
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
        lectures = Lecture.objects.filter(deleted=False).exclude(Lecture.get_query_for_research())

        year = request.GET.get("year", None)
        semester = request.GET.get("semester", None)
        lectures = services.filter_by_semester(lectures, year, semester)

        day = request.GET.get("day", None)
        begin = request.GET.get("begin", None)
        end = request.GET.get("end", None)
        lectures = services.filter_by_time(lectures, day, begin, end)

        department = request.GET.getlist("department", [])
        lectures = services.filter_by_department(lectures, department)

        type_ = request.GET.getlist("type", [])
        lectures = services.filter_by_type(lectures, type_)

        level = request.GET.getlist("grade", [])
        lectures = services.filter_by_level(lectures, level)

        group = request.GET.getlist("group", [])
        lectures = services.filter_by_group(lectures, group)

        keyword = request.GET.get("keyword", "")
        lectures = services.filter_by_keyword(lectures, keyword)

        # lectures = lectures
        # .select_related('course', 'department') \
        # .prefetch_related('classtimes', 'examtimes', 'professors') \

        lectures = apply_order(lectures, request.GET, LectureListView.DEFAULT_ORDER)
        lectures = apply_offset_and_limit(lectures, request.GET, LectureListView.MAX_LIMIT)
        result = [lecture.to_json(nested=False) for lecture in lectures]
        return JsonResponse(result, safe=False)


class LectureInstanceView(View):
    def get(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        result = lecture.to_json()
        return JsonResponse(result)


class LectureListAutocompleteView(View):
    def get(self, request):
        try:
            year = request.GET["year"]
            semester = request.GET["semester"]
            keyword = request.GET["keyword"]
        except KeyError:
            return HttpResponseBadRequest("Missing fields in request data")

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
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = lecture.reviews.all()

        reviews = apply_order(reviews, request.GET, LectureInstanceReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, request.GET, LectureInstanceReviewsView.MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


class LectureInstanceRelatedReviewsView(View):
    MAX_LIMIT = 100
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)
        reviews = Review.objects.filter(
            lecture__course=lecture.course,
            lecture__professors__in=lecture.professors.all(),
        )

        reviews = apply_order(reviews, request.GET, LectureInstanceRelatedReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, request.GET,
                                         LectureInstanceRelatedReviewsView.MAX_LIMIT)
        result = [review.to_json() for review in reviews]
        return JsonResponse(result, safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTakenCoursesView(View):
    DEFAULT_ORDER = ['old_code']

    def get(self, request, user_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)
        courses = Course.objects.filter(lectures__in=userprofile.taken_lectures.all())

        courses = apply_order(courses, request.GET, UserInstanceTakenCoursesView.DEFAULT_ORDER)
        result = [course.to_json(user=request.user) for course in courses]
        return JsonResponse(result, safe=False)
