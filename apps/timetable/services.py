from apps.subject.models import Lecture
from .models import Timetable
from apps.session.models import UserProfile
from typing import List, Optional

from django.contrib.auth.models import User


MY_TIMETABLE_ID = -1
INVALID_DEPARTMENT_CODES = ["AA", "ICE"]


def get_user_department_list(user: User) -> List:
    if not user.is_authenticated:
        return []

    profile = user.userprofile

    if profile.department is None or profile.department.code in INVALID_DEPARTMENT_CODES:
        departments = []
    else:
        departments = [profile.department.toJson()]

    raw_departments = [
        *list(profile.majors.all()),
        *list(profile.minors.all()),
        *profile.specialized_major.all(),
        *profile.favorite_departments.all()
    ]

    for d in raw_departments:
        data = d.toJson()
        if data not in departments:
            departments.append(data)

    return departments


def get_timetable_entries(profile: UserProfile, table_id: int, year: int, semester: int) -> Optional[List[Lecture]]:
    if profile == None:
        return None

    if table_id == MY_TIMETABLE_ID:
        return list(profile.taken_lectures.filter(year=year, semester=semester))
    
    try:
        table = Timetable.objects.get(user=profile, id=table_id, year=year, semester=semester)
    except Timetable.DoesNotExist:
        return None
    
    return list(table.lectures.all())
