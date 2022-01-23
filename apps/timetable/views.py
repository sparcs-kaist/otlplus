import json

from django.db.models import F
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order


from apps.subject.models import Semester, Lecture
from .models import Timetable, Wishlist
from .services import create_timetable_ical, create_timetable_image, get_timetable_entries


def _validate_year_semester(year, semester):
    return Semester.objects.filter(year=year, semester=semester).exists() or (
        2009 < year < 2018 and semester in [1, 3]
    )  # TODO: Complete Semester instances and remove this condition


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableListView(View):
    def get(self, request, user_id):
        MAX_LIMIT = 50
        DEFAULT_ORDER = ['year', 'semester', 'arrange_order', 'id']
        PARAMS_STRUCTURE = [
            ("year", ParseType.INT, False, []),
            ("semester", ParseType.INT, False, []),
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        year, semester, order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        timetables = userprofile.timetables.all()

        if year is not None:
            timetables = timetables.filter(year=year)
        if year is not None:
            timetables = timetables.filter(semester=semester)

        timetables = apply_order(timetables, order, DEFAULT_ORDER)
        timetables = apply_offset_and_limit(timetables, offset, limit, MAX_LIMIT)
        result = [t.to_json() for t in timetables]
        return JsonResponse(result, safe=False)

    def post(self, request, user_id):
        BODY_STRUCTURE = [
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
            ("lectures", ParseType.LIST_INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        year, semester, lecture_ids = parse_body(request.body, BODY_STRUCTURE)

        if not _validate_year_semester(year, semester):
            return HttpResponseBadRequest("Wrong fields 'year' and 'semester' in request data")

        related_timetables = Timetable.get_related_timetables(userprofile, year, semester)
        if related_timetables.exists():
            arrange_order = related_timetables.order_by("arrange_order").last().arrange_order + 1
        else:
            arrange_order = 0

        timetable = Timetable.objects.create(user=userprofile, year=year, semester=semester,
                                             arrange_order=arrange_order)
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
        related_timetables = Timetable.get_related_timetables(userprofile,
                                                              timetable.year, timetable.semester)
        related_timetables.filter(arrange_order__gt=timetable.arrange_order) \
                          .update(arrange_order=F('arrange_order')-1)
        return HttpResponse()


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableInstanceAddLectureView(View):
    def post(self, request, user_id, timetable_id):
        BODY_STRUCTURE = [
            ("lecture", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        if request.method == "POST":
            lecture_id, = parse_body(request.body, BODY_STRUCTURE)

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
        BODY_STRUCTURE = [
            ("lecture", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        lecture_id, = parse_body(request.body, BODY_STRUCTURE)

        if not timetable.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        timetable.lectures.remove(lecture)
        return JsonResponse(timetable.to_json())


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceTimetableInstanceReorderView(View):
    def post(self, request, user_id, timetable_id):
        BODY_STRUCTURE = [
            ("arrange_order", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        try:
            timetable = userprofile.timetables.get(id=timetable_id)
        except Timetable.DoesNotExist:
            return HttpResponseNotFound()

        arrange_order, = parse_body(request.body, BODY_STRUCTURE)

        related_timetables = Timetable.get_related_timetables(userprofile,
                                                              timetable.year, timetable.semester)
        original_arrange_order = timetable.arrange_order
        temp_arrange_order = related_timetables.order_by("arrange_order").last().arrange_order + 100
        timetable.arrange_order = temp_arrange_order
        timetable.save()
        if arrange_order < original_arrange_order:
            related_timetables.filter(arrange_order__gte=arrange_order,
                                      arrange_order__lt=original_arrange_order) \
                              .update(arrange_order=F("arrange_order")+1)
        elif arrange_order > original_arrange_order:
            print(123)
            related_timetables.filter(arrange_order__gt=original_arrange_order,
                                      arrange_order__lte=arrange_order) \
                              .update(arrange_order=F("arrange_order")-1)
        timetable.arrange_order = arrange_order
        timetable.save()
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
        BODY_STRUCTURE = [
            ("lecture", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

        lecture_id, = parse_body(request.body, BODY_STRUCTURE)

        if wishlist.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.add(lecture)

        result = wishlist.to_json()
        return JsonResponse(result)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceWishlistRemoveLectureView(View):
    def post(self, request, user_id):
        BODY_STRUCTURE = [
            ("lecture", ParseType.INT, True, []),
        ]

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]

        lecture_id, = parse_body(request.body, BODY_STRUCTURE)

        if not wishlist.lectures.filter(id=lecture_id).exists():
            return HttpResponseBadRequest("Wrong field 'lecture' in request data")

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.remove(lecture)

        result = wishlist.to_json()
        return JsonResponse(result)


@method_decorator(login_required_ajax, name="dispatch")
class ShareTimetableCalendarView(View):
    def get(self, request):
        PARAMS_STRUCTURE = [
            ("timetable", ParseType.INT, True, []),
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
        ]

        table_id, year, semester = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        return HttpResponseBadRequest("Not implemented")


@method_decorator(login_required_ajax, name="dispatch")
class ShareTimetableIcalView(View):
    def get(self, request):
        PARAMS_STRUCTURE = [
            ("timetable", ParseType.INT, True, []),
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
        ]

        table_id, year, semester = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile

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
        PARAMS_STRUCTURE = [
            ("timetable", ParseType.INT, True, []),
            ("year", ParseType.INT, True, []),
            ("semester", ParseType.INT, True, []),
        ]

        table_id, year, semester = parse_params(request.GET, PARAMS_STRUCTURE)

        userprofile = request.user.userprofile

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest("No such timetable")

        response = HttpResponse(content_type="image/png")
        image = create_timetable_image(timetable_lectures)
        image.save(response, "PNG")
        return response
