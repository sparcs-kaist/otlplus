from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.http import HttpResponseBadRequest

from utils.decorators import login_required_ajax

from .models import Semester, Course, Lecture, Professor, CourseUser
from apps.review.models import Review
from utils.util import getint, get_paginated_queryset
from . import services


@require_http_methods(["GET"])
def semester_list_view(request):
    semesters = Semester.objects.all().order_by("year", "semester")

    result = [semester.toJson() for semester in semesters]
    return JsonResponse(result, safe=False)


@require_http_methods(["GET"])
def course_list_view(request):
    MAX_LIMIT = 150

    courses = Course.objects.all().order_by("old_code")
    courses = services.filter_lectures_from_querystring(courses, request.GET)

    term = request.GET.get("term", None)
    courses = services.filter_by_term(courses, term)

    courses = courses.distinct()
    # .select_related('department') \
    # .prefetch_related('related_courses_prior', 'related_courses_posterior', 'professors', 'read_users_courseuser')

    offset = getint(request.GET, "offset", None)
    limit = getint(request.GET, "limit", None)
    courses = get_paginated_queryset(courses, offset, limit, MAX_LIMIT)
    result = [c.toJson(user=request.user) for c in courses]
    return JsonResponse(result, safe=False)


@require_http_methods(["GET"])
def course_instance_view(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    result = course.toJson(user=request.user)
    return JsonResponse(result)


@require_http_methods(["GET"])
def course_list_autocomplete_view(request):
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


@require_http_methods(["GET"])
def course_instance_reviews_view(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    reviews = course.reviews.all().order_by("-lecture__year", "-written_datetime")
    reviews = reviews[:100]

    result = [review.toJson(user=request.user) for review in reviews]
    return JsonResponse(result, safe=False)


@require_http_methods(["GET"])
def course_instance_lectures_view(request, course_id):
    if request.method == "GET":
        course = get_object_or_404(Course, id=course_id)
        lectures = course.lectures.filter(deleted=False).order_by("year", "semester", "class_no")

        result = [lecture.toJson() for lecture in lectures]
        return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(["POST"])
def course_instance_read_view(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    profile = request.user.userprofile

    try:
        course_user = CourseUser.objects.get(user_profile=profile, course=course)
        course_user.save()
    except CourseUser.DoesNotExist:
        CourseUser.objects.create(user_profile=profile, course=course)
    return HttpResponse()


@require_http_methods(["GET"])
def lecture_list_view(request):
    MAX_LIMIT = 300

    lectures = Lecture.objects.filter(deleted=False).exclude(Lecture.getQueryResearch())

    year = request.GET.get("year", None)
    semester = request.GET.get("semester", None)
    lectures = services.filter_by_semester(lectures, year, semester)

    day = request.GET.get("day", None)
    begin = request.GET.get("begin", None)
    end = request.GET.get("end", None)
    lectures = services.filter_by_time(lectures, day, begin, end)

    lectures = services.filter_lectures_from_querystring(lectures, request.GET)

    lectures = lectures.distinct().order_by("old_code", "class_no")
    # .select_related('course', 'department') \
    # .prefetch_related('classtimes', 'examtimes', 'professors') \

    offset = getint(request.GET, "offset", None)
    limit = getint(request.GET, "limit", None)
    lectures = get_paginated_queryset(lectures, offset, limit, MAX_LIMIT)
    result = [lecture.toJson(nested=False) for lecture in lectures]
    return JsonResponse(result, safe=False)


@require_http_methods(["GET"])
def lecture_instance_view(request, lecture_id):
    lecture = get_object_or_404(Lecture, id=lecture_id)

    result = lecture.toJson()
    return JsonResponse(result)


@require_http_methods(["GET"])
def lecture_list_autocomplete_view(request):
    if request.method == "GET":
        try:
            year = request.GET["year"]
            semester = request.GET["semester"]
            keyword = request.GET["keyword"]
        except KeyError:
            return HttpResponseBadRequest("Missing fields in request data")

        lectures = Lecture.objects.filter(deleted=False, year=year, semester=semester)
        professors = Professor.objects.filter(lectures__deleted=False, lectures__year=year, lectures__semester=semester)

        match = services.match_autocomplete(keyword, lectures, professors)
        if not match:
            return JsonResponse(keyword, safe=False)
        return JsonResponse(match, safe=False)


@require_http_methods(["GET"])
def lecture_instance_reviews_view(request, lecture_id):
    lecture = get_object_or_404(Lecture, id=lecture_id)
    reviews = lecture.reviews.all().order_by("-id")

    result = [review.toJson() for review in reviews]
    return JsonResponse(result, safe=False)


@require_http_methods(["GET"])
def lecture_instance_related_reviews_view(request, lecture_id):
    lecture = get_object_or_404(Lecture, id=lecture_id)
    reviews = Review.objects.filter(
        lecture__course=lecture.course,
        lecture__professors__in=lecture.professors.all(),
    ).order_by("-id")

    result = [review.toJson() for review in reviews]
    return JsonResponse(result, safe=False)


@login_required_ajax
@require_http_methods(["GET"])
def user_instance_taken_courses_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)
    courses = Course.objects.filter(lectures__in=userprofile.taken_lectures.all()).order_by("old_code").distinct()

    result = [course.toJson(user=request.user) for course in courses]
    return JsonResponse(result, safe=False)
