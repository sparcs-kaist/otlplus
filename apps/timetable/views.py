import json

from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParamsType, BodyType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, getint


from apps.subject.models import Semester, Lecture
from .models import Timetable, Wishlist
from .services import create_timetable_ical, create_timetable_image, get_timetable_entries


def _validate_year_semester(year, semester):
    return Semester.objects.filter(year=year, semester=semester).exists() or (
        2009 < year < 2018 and semester in [1, 3]
    )  # TODO: Complete Semester instances and remove this condition


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableListView(View):
    MAX_LIMIT = 50
    DEFAULT_ORDER = ['year', 'semester', 'id']

    def get(self, request, user_id):
        year = parse_params(request.GET, ("year", ParamsType.INT, False, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, False, []))
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        timetables = userprofile.timetables.all()

        if year is not None:
            timetables = timetables.filter(year=year)
        if year is not None:
            timetables = timetables.filter(semester=semester)

        timetables = apply_order(timetables, order,
                                 UserInstanceTimetableListView.DEFAULT_ORDER)
        timetables = apply_offset_and_limit(timetables, offset, limit,
                                            UserInstanceTimetableListView.MAX_LIMIT)
        result = [t.to_json() for t in timetables]
        return JsonResponse(result, safe=False)

    def post(self, request, user_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        body = json.loads(request.body.decode("utf-8"))

        year = parse_body(body, ("year", BodyType.INT, True, []))
        semester = parse_body(body, ("semester", BodyType.INT, True, []))
        lecture_ids = parse_body(body, ("lectures", BodyType.LIST_INT, True, []))

        if not _validate_year_semester(year, semester):
            return HttpResponseBadRequest("Wrong fields 'year' and 'semester' in request data")

        timetable = Timetable.objects.create(user=userprofile, year=year, semester=semester)
        for i in lecture_ids:
            try:
                lecture = Lecture.objects.get(id=i, year=year, semester=semester)
            except Lecture.DoesNotExist:
                return HttpResponseBadRequest("Wrong field 'lectures' in request data")
            timetable.lectures.add(lecture)

        return JsonResponse(timetable.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableInstanceView(View):
    def get(self, request, user_id, timetable_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        return JsonResponse(timetable.to_json())

    def delete(self, request, user_id, timetable_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        timetable.delete()
        return HttpResponse()


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableInstanceAddLectureView(View):
    def post(self, request, user_id, timetable_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        if request.method == "POST":
            body = json.loads(request.body.decode("utf-8"))

            lecture_id = parse_body(body, ("lecture", BodyType.INT, True, []))

            lecture = Lecture.objects.get(id=lecture_id)
            if not (lecture.year == timetable.year and lecture.semester == timetable.semester):
                return HttpResponseBadRequest("Wrong field 'lecture' in request data")

            if timetable.lectures.filter(id=lecture_id).exists():
                return HttpResponseBadRequest('Wrong field \'lecture\' in request data')

            if timetable.lectures.filter(id=lecture_id).exists():
                return HttpResponseBadRequest('Wrong field \'lecture\' in request data')

            timetable.lectures.add(lecture)
            return JsonResponse(timetable.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableInstanceRemoveLectureView(View):
    def post(self, request, user_id, timetable_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        body = json.loads(request.body.decode("utf-8"))

        lecture_id = parse_body(body, ("lecture", BodyType.INT, True, []))

        if not timetable.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        timetable.lectures.remove(lecture)
        return JsonResponse(timetable.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceWishlistView(View):
    def get(self, request, user_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

        result = wishlist.to_json()
        return JsonResponse(result)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceWishlistAddLectureView(View):
    def post(self, request, user_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

        body = json.loads(request.body.decode("utf-8"))

        lecture_id = parse_body(body, ("lecture", BodyType.INT, True, []))

        if wishlist.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.add(lecture)

        result = wishlist.to_json()
        return JsonResponse(result)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceWishlistRemoveLectureView(View):
    def post(self, request, user_id):
        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

        body = json.loads(request.body.decode("utf-8"))

        lecture_id = parse_body(body, ("lecture", BodyType.INT, True, []))

        if not wishlist.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.remove(lecture)

        result = wishlist.to_json()
        return JsonResponse(result)


@method_decorator(login_required_ajax, name="dispatch")
class ShareTimetableCalendarView(View):
    def get(self, request):
        table_id = parse_params(request.GET, ("table_id", ParamsType.INT, True, []))
        year = parse_params(request.GET, ("year", ParamsType.INT, True, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, True, []))

        userprofile = request.user.userprofile

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        return HttpResponseBadRequest("Not implemented")


@method_decorator(login_required_ajax, name="dispatch")
class ShareTimetableIcalView(View):
    def get(self, request):
        table_id = parse_params(request.GET, ("table_id", ParamsType.INT, True, []))
        year = parse_params(request.GET, ("year", ParamsType.INT, True, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, True, []))

        userprofile = request.user.userprofile

        if not (table_id is not None and year is not None and semester is not None):
            return HttpResponseBadRequest("Missing fields in request data")

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        calendar = create_timetable_ical(Semester.objects.get(year=year, semester=semester),
                                         timetable_lectures)
        response = HttpResponse(calendar.to_ical(), content_type="text/calendar")
        return response


@method_decorator(login_required_ajax, name="dispatch")
class ShareTimetableImageView(View):
    def get(self, request):
        table_id = parse_params(request.GET, ("table_id", ParamsType.INT, True, []))
        year = parse_params(request.GET, ("year", ParamsType.INT, True, []))
        semester = parse_params(request.GET, ("semester", ParamsType.INT, True, []))

        userprofile = request.user.userprofile

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        response = HttpResponse(content_type="image/png")
        image = create_timetable_image(timetable_lectures)
        image.save(response, "PNG")
        return response
