from typing import Set

from apps.planner.models import Credit, DeptCode, Track, TrackType
from apps.session.models import UserProfile
from apps.subject.models import Department
from django.test import TestCase
from typing_extensions import TypedDict

from tests.fixtures.course import _import_departments


class TrackInfo(TypedDict):
    major: DeptCode
    double_majors: Set[DeptCode]
    minors: Set[DeptCode]
    specialized_majors: Set[DeptCode]
    self_designed: bool


class TrackModelTest(TestCase):
    def setUp(self):
        _import_departments()  # code가 같으면 id가 큰 것이 override; 애매해서 직접 self.dept 만들어서 쓰기로 함
        # print(f"Visible: {len(Department.objects.filter(visible=1))}")
        # print(f"All: {len(Department.objects.all())}")

    def get_dept(self, code: DeptCode) -> Department:
        # TODO IMPORTANT Enum.name, Enum.value; don't forget about DeptCode.name, DeptCode.value
        return Department.objects.filter(visible=1, code=code.name).get()

    def create_track(self, track_info: TrackInfo):
        track = Track.objects.create(major=self.get_dept(
            track_info["major"]), self_designed=track_info["self_designed"])
        print("DORA", list(track_info.keys()))
        print("double_majors" in track_info.keys())
        print(track_info["double_majors"])

        def dept_code_set_to_dept_name_list(dcs):
            return list(map(lambda x: x.name, list(dcs)))

        track.double_majors.add(*Department.objects.filter(
            code__in=dept_code_set_to_dept_name_list(track_info["double_majors"])))
        track.minors.add(*Department.objects.filter(
            code__in=dept_code_set_to_dept_name_list(track_info["minors"])))
        track.specialized_majors.add(*Department.objects.filter(
            code__in=dept_code_set_to_dept_name_list(track_info["specialized_majors"])))
        return track

    def test_validate_track_about_duplicate(self):
        trackInfo: TrackInfo = {
            "major": DeptCode.EE,
            "double_majors": set([DeptCode.ID]),
            "minors": set([DeptCode.EE]),
            "specialized_majors": set([DeptCode.CS]),
            "self_designed": False
        }
        track = self.create_track(trackInfo)
        self.assertEquals(track.validate(), False)

    def test_validate_track_about_duplicate(self):
        trackInfo: TrackInfo = {
            "major": DeptCode.CS,
            "double_majors": set([DeptCode.ID]),
            "minors": set([DeptCode.EE]),
            "specialized_majors": set([DeptCode.CS]),
            "self_designed": False
        }
        track = self.create_track(trackInfo)
        user = UserProfile(student_id="20220768")
        print("Credit_for_dept:", Credit.credit_for_dept(user, DeptCode.CS, TrackType.major))
        print("Credit_for_track:", Credit.credit_for_track(user, track))
