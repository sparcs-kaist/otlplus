# Django apps
from .models import Timetable, Wishlist
from utils.util import getint

# Django modules
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.views.decorators.http import require_http_methods
from .services import create_timetable_image, get_timetable_entries

import json

from ..subject.models import Semester, Lecture


def _validate_year_semester(year, semester):
    return Semester.objects.filter(year=year, semester=semester).exists() or (
        2009 < year < 2018 and semester in [1, 3]
    )  # TODO: Complete Semester instances and remove this condition


@login_required_ajax
@require_http_methods(["GET", "POST"])
def user_instance_timetable_list_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    if request.method == "GET":
        timetables = userprofile.timetables.all()

        year = getint(request.GET, "year", None)
        if year is not None:
            timetables = timetables.filter(year=year)

        semester = getint(request.GET, "semester", None)
        if year is not None:
            timetables = timetables.filter(semester=semester)

        result = [t.toJson() for t in timetables]
        return JsonResponse(result, safe=False)

    elif request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))

        year = body.get("year", None)
        semester = body.get("semester", None)
        if year is None:
            return HttpResponseBadRequest("Missing field 'year' in request data")
        if semester is None:
            return HttpResponseBadRequest("Missing field 'semester' in request data")
        if not _validate_year_semester(year, semester):
            return HttpResponseBadRequest("Wrong fields 'year' and 'semester' in request data")

        lecture_ids = body.get("lectures", None)
        if lecture_ids is None:
            return HttpResponseBadRequest("Missing field 'lectures' in request data")

        timetable = Timetable.objects.create(user=userprofile, year=year, semester=semester)
        for i in lecture_ids:
            try:
                lecture = Lecture.objects.get(id=i, year=year, semester=semester)
            except Lecture.DoesNotExist:
                return HttpResponseBadRequest("Wrong field 'lectures' in request data")
            timetable.lectures.add(lecture)

        return JsonResponse(timetable.toJson())


@login_required_ajax
@require_http_methods(["GET", "DELETE"])
def user_instance_timetable_instance_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()

    if request.method == "GET":
        return JsonResponse(timetable.toJson())

    elif request.method == "DELETE":
        timetable.delete()
        return HttpResponse()


@login_required_ajax
@require_http_methods(["POST"])
def user_instance_timetable_instance_add_lecture_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()

    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))

        lecture_id = getint(body, "lecture", None)
        if lecture_id is None:
            return HttpResponseBadRequest("Missing field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)
        if not (lecture.year == timetable.year and lecture.semester == timetable.semester):
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        timetable.lectures.add(lecture)
        return JsonResponse(timetable.toJson())


@login_required_ajax
@require_http_methods(["POST"])
def user_instance_timetable_instance_remove_lecture_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()

    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))

        lecture_id = getint(body, "lecture", None)
        if lecture_id is None:
            return HttpResponseBadRequest("Missing field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        timetable.lectures.remove(lecture)
        return JsonResponse(timetable.toJson())


@login_required_ajax
@require_http_methods(["GET"])
def user_instance_wishlist_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

    if request.method == "GET":
        result = wishlist.toJson()
        return JsonResponse(result)


@login_required_ajax
@require_http_methods(["POST"])
def user_instance_wishlist_add_lecture_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))

        lecture_id = getint(body, "lecture", None)
        if lecture_id is None:
            return HttpResponseBadRequest("Missing field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.add(lecture)

        result = wishlist.toJson()
        return JsonResponse(result)


@login_required_ajax
@require_http_methods(["POST"])
def user_instance_wishlist_remove_lecture_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

    if request.method == "POST":
        body = json.loads(request.body.decode("utf-8"))

        lecture_id = getint(body, "lecture", None)
        if lecture_id is None:
            return HttpResponseBadRequest("Missing field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.remove(lecture)

        result = wishlist.toJson()
        return JsonResponse(result)


# Export OTL timetable to google calendar
@login_required
@require_http_methods(["GET"])
def share_timetable_calendar_view(request):
    userprofile = request.user.userprofile

    if request.method == "GET":
        table_id = getint(request.GET, "timetable", None)
        year = getint(request.GET, "year", None)
        semester = getint(request.GET, "semester", None)
        if not (table_id is not None and year is not None and semester is not None):
            return HttpResponseBadRequest("Missing fields in request data")

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        # TODO: Add impl
        return HttpResponseBadRequest("Not implemented")
        # response = _share_calendar(request, timetable_lectures, year, semester)
        # return response


@login_required
@require_http_methods(["GET"])
def share_timetable_image_view(request):
    userprofile = request.user.userprofile

    if request.method == "GET":
        table_id = getint(request.GET, "timetable", None)
        year = getint(request.GET, "year", None)
        semester = getint(request.GET, "semester", None)
        if not (table_id is not None and year is not None and semester is not None):
            return HttpResponseBadRequest("Missing fields in request data")

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        response = HttpResponse(content_type="image/png")
        image = create_timetable_image(timetable_lectures)
        image.save(response, "PNG")
        return response
