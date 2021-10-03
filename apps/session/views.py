import json
import random

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_body

from apps.subject.models import Department, Lecture
from apps.session.services import get_user_department_list, get_user_major_list, json_encode_list
from .models import UserProfile
from .services import import_student_lectures
from .sparcsssov2 import Client


UNDERGRADUATE_DEPARTMENTS = [
    "CE",
    "MSB",
    "ME",
    "PH",
    "BiS",
    "IE",
    "ID",
    "BS",
    "CBE",
    "MAS",
    "MS",
    "NQE",
    "HSS",
    "EE",
    "CS",
    "AE",
    "CH",
    "TS",
]
EXCLUDED_DEPARTMENTS = [
    "AA",
    "KSA",
    "URP",
    "ED",
    "INT",
    "KJ",
    "CWENA",
    "C",
    "E",
    "S",
    "PSY",
    "SK",
    "BIO",
    "CLT",
    "PHYS",
]


sso_client = Client(settings.SSO_CLIENT_ID, settings.SSO_SECRET_KEY, is_beta=settings.SSO_IS_BETA)


def home(request):
    return HttpResponseRedirect("./login/")


def user_login(request):
    user = request.user
    if user and user.is_authenticated:
        return redirect(request.GET.get("next", "/"))

    request.session["next"] = request.GET.get("next", "/")

    login_url, state = sso_client.get_login_params()
    request.session["sso_state"] = state
    return HttpResponseRedirect(login_url)


@require_http_methods(["GET"])
def login_callback(request):
    state_before = request.session.get("sso_state", None)
    state = request.GET.get("state", None)
    if state_before is None or state_before != state:
        return HttpResponseRedirect("/error/invalid-login")

    code = request.GET.get("code")
    sso_profile = sso_client.get_user_info(code)
    username = sso_profile["sid"]

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = None

    try:
        kaist_info = json.loads(sso_profile["kaist_info"])
        student_id = kaist_info.get("ku_std_no")
    except Exception:
        student_id = ""

    if student_id is None:
        student_id = ""

    if user is None:
        user = User.objects.create_user(
            username=username,
            email=sso_profile["email"],
            password=str(random.getrandbits(32)),
            first_name=sso_profile["first_name"],
            last_name=sso_profile["last_name"],
        )
        user_profile, _ = UserProfile.objects.get_or_create(student_id=sso_profile["sid"],
                                                            defaults={"user": user})
        user_profile.sid = sso_profile["sid"]
        user_profile.save()
        import_student_lectures(student_id)
    else:
        user.first_name = sso_profile["first_name"]
        user.last_name = sso_profile["last_name"]
        user.save()

        user_profile = user.userprofile
        previous_student_id = user_profile.student_id
        user_profile.student_id = student_id
        user_profile.save()

        if previous_student_id != student_id:
            import_student_lectures(student_id)

    login(request, user, backend="apps.session.auth_backend.PasswordlessModelBackend")
    next_url = request.session.pop("next", "/")
    return redirect(next_url)


def user_logout(request):
    if request.user.is_authenticated:
        sid = request.user.userprofile.sid
        redirect_url = request.GET.get("next", request.build_absolute_uri("/"))
        logout_url = sso_client.get_logout_url(sid, redirect_url)
        logout(request)
        request.session["visited"] = True
        return redirect(logout_url)
    return redirect("/")


def department_options(request):
    deps_undergraduate = []
    deps_recent = []
    deps_other = []
    year_threshold = timezone.now().year - 2
    recent_lectures = Lecture.objects.filter(year__gte=year_threshold) \
                                     .prefetch_related("department")

    query = Department.objects.filter(visible=True) \
                              .exclude(code__in=EXCLUDED_DEPARTMENTS) \
                              .order_by("name")
    for department in query:
        if department.code in UNDERGRADUATE_DEPARTMENTS:
            deps_undergraduate.append(department)
        elif recent_lectures.filter(department__code=department.code).exists():
            deps_recent.append(department)
        else:
            deps_other.append(department)

    result = [
        json_encode_list(deps_undergraduate),
        json_encode_list(deps_recent),
        json_encode_list(deps_other),
    ]

    return JsonResponse(result, safe=False)


@login_required_ajax
def favorite_departments(request):
    user = request.user
    user_profile = user.userprofile

    if request.method == "POST":
        BODY_STRUCTURE = [
            ("fav_department", ParseType.LIST_INT, True, []),
        ]

        fav_department, = parse_body(request.body, BODY_STRUCTURE)

        user_profile.favorite_departments.clear()
        for department_id in fav_department:
            department_obj = Department.objects.get(id=department_id)
            user_profile.favorite_departments.add(department_obj)
        return HttpResponse()

    return HttpResponseBadRequest()


@login_required(login_url="/session/login/")
def unregister(request):
    if request.method != "POST":
        return HttpResponseRedirect("/error/problem-unregister")

    user = request.user
    user_profile = user.userprofile

    sid = user_profile.sid
    result = sso_client.do_unregister(sid)
    if not result:
        return HttpResponseRedirect("/error/problem-unregister")

    user_profile.delete()
    user.delete()
    logout(request)

    return JsonResponse(status=200, data={})


@login_required_ajax
def info(request):
    profile = request.user.userprofile
    ctx = {
        "id": profile.id,
        "email": profile.user.email,
        "student_id": profile.student_id,
        "firstName": request.user.first_name,
        "lastName": request.user.last_name,
        "majors": get_user_major_list(profile),
        "departments": get_user_department_list(request.user),
        "favorite_departments": json_encode_list(profile.favorite_departments.all()),
        "review_writable_lectures": json_encode_list(profile.review_writable_lectures),
        "my_timetable_lectures": json_encode_list(profile.taken_lectures.exclude(Lecture.get_query_for_research())),
        "reviews": json_encode_list(profile.reviews.all()),
    }
    return JsonResponse(ctx, safe=False)
