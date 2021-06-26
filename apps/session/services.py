import os
from typing import List, Dict, Union, Iterable

from apps.review.models import Review
from apps.timetable.models import OldTimetable, User, Department, UserProfile, Lecture
from django.conf import settings


INVALID_DEPARTMENT_CODES = ["AA", "ICE"]


def json_encode_list(items: Iterable[Union[Department, Lecture, Review]], **kwargs) -> List[Dict]:
    return [item.toJson(**kwargs) for item in items]


def unique_id_dict_list(dict_list: List[Dict]) -> List[Dict]:
    return list({
        item["id"]: item for item in dict_list
    })


def get_user_department_list(user: User) -> List:
    if not user.is_authenticated:
        return []

    profile = user.userprofile

    if profile.department is None or profile.department.code in INVALID_DEPARTMENT_CODES:
        departments = []
    else:
        departments = [profile.department.toJson()]

    departments.extend([
        *list(profile.majors.all()),
        *list(profile.minors.all()),
        *list(profile.specialized_major.all()),
        *list(profile.favorite_departments.all())
    ])
    departments = json_encode_list(departments)
    departments = unique_id_dict_list(departments)
    return departments


def get_user_major_list(profile: Union[User, UserProfile]) -> List[Dict]:
    if isinstance(profile, User):
        profile = profile.userprofile
    majors = []
    if profile.department is not None:
        majors.append(profile.department)
    majors.extend(list(profile.majors.all()))
    majors.extend(list(profile.minors.all()))
    majors = json_encode_list(majors)
    majors = unique_id_dict_list(majors)
    return majors


def import_student_lectures(student_id: str) -> None:
    if not settings.DEBUG:
        os.chdir('/var/www/otlplus/')
    os.system('python do_import_user_major.py %s' % student_id)
    os.system('python do_import_taken_lecture_user.py %s' % student_id)
    OldTimetable.import_in_for_user(student_id)
