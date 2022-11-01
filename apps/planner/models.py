from __future__ import annotations

from enum import Enum, auto
from typing import Dict, List, Tuple, Union, cast

from django.db import models

from apps.session.models import UserProfile

from apps.subject.models import Department


# change into - TODO
class TrackType(Enum):
    major = "major"
    double_majors = "double_majors"
    minors = "minors"
    specialized_majors = "specialized_majors"
    self_designed = "self_designed"

# Department.objects.all().map(dept => dept.code) - Dept_code != emptyset이 아닐 거라서 언제가 문제가 됨
# 다만 이거 제외하는 건 아마 KSA처럼 예외 케이스라 주요 사항은 아님


class DeptCode(Enum):
    AE = auto()  # 0
    BIS = auto()  # 1
    BS = auto()
    CBE = auto()
    CE = auto()
    CH = auto()
    CS = auto()
    EE = auto()
    ID = auto()
    IE = auto()
    MAS = auto()
    ME = auto()
    MS = auto()
    MSB = auto()
    NQE = auto()
    PH = auto()
    TS = auto()


def get_all_dept() -> Department:
    return Department.objects.filter(visible=1).all()


def get_dept(code: DeptCode) -> Department:
    return Department.objects.filter(visible=1, code=code.name).get()


class Track(models.Model):
    major = models.ForeignKey(Department, related_name="major",
                              on_delete=models.PROTECT, default=Department.objects.first().pk)
    double_majors = models.ManyToManyField(
        Department, related_name="double_majors")
    minors = models.ManyToManyField(Department, related_name="minors")
    specialized_majors = models.ManyToManyField(
        Department, related_name="specialized_majors")
    self_designed = models.BooleanField(default=False)

    def validate(self: Track):
        # need to care Freshman as 'FRS = Fresh'
        try:
            mj = set([self.major])
            dm = set(self.double_majors.all())
            mn = set(self.minors.all())
            am = set(self.specialized_majors.all())
            sd = self.self_designed
            assert len((mj & dm) | (dm & mn) | (mn & mj)) == 0, \
                "Invalid TrackInfo: major, double, minor cannot contain duplicates of each other"
            assert (mj | dm).issuperset(am), \
                "Invalid TrackInfo: (major + double) must contain advanced"
            assert len(dm) != 0 \
                or len(mn) != 0 \
                or len(am) != 0 \
                or sd, \
                "Invalid TrackInfo: please choose Track"
            assert len(dm | mn | am) == 0 if sd else True, \
                "Invalid TrackInfo: if self designed, other info should not exist"
            assert not (get_dept(DeptCode.MSB) in am), \
                "Invalid TrackInfo: MSB cannot be advanced_major"
        except AssertionError as e:
            # print(e)
            return False
        else:
            return True

    def is_self_designed(self: Track) -> bool:
        return self.self_designed

    def contain_dept_as_track_type(self: Track, dept: Department, track_type: TrackType) -> bool:
        if (self.self_designed and track_type != TrackType.major):
            return False
        else:
            if track_type == TrackType.major:
                return self.major.code == dept.code
            else:
                return len(getattr(self, track_type.value).filter(code = dept.code)) != 0


class Credit():
    Credit_Info = List[Tuple[int, int]]
    Credit_Info_Exception = Dict[str, Credit_Info]
    # TODO CHANGE ORDER by print
    credit_info: Dict[DeptCode, Union[Credit_Info, Credit_Info_Exception]] = {
        DeptCode.CE: [(12, 45), (12, 57), (12, 18), (12, 40)],
        DeptCode.ME: [(12, 48), (12, 63), (6, 21), (12, 40)],
        # Impossible for MSB as advanced_major
        DeptCode.MSB: [(9, 48), (0, 0), (6, 18), (6, 40)],
        DeptCode.PH: [(19, 43),  (19, 55),  (6, 18),  (19, 40)],
        DeptCode.BIS: [(14, 44), (14, 56), (14, 18), (14, 40)],
        DeptCode.ID: [(15, 45), (15, 57), (9, 18), (15, 40)],
        DeptCode.IE: [(24, 45), (24, 57), (0, 18), (24, 40)],
        DeptCode.BS: [(18, 42),  (18, 54), (12, 21), (18, 40)],
        DeptCode.CBE: [(21, 42), (21, 54), (9, 18),  (21, 42)],
        DeptCode.MAS: [(0, 42), (0, 55), (0, 18), (0, 40)],
        DeptCode.MS: [(18, 42), (18, 57),  (9, 18), (18, 40)],
        DeptCode.NQE: [(25, 43), (25, 55), (15, 21), (25, 40)],
        DeptCode.TS: [(21, 42), (21, 54), (18, 18), (21, 42)],
        DeptCode.EE: {
            "2016, 2017": [(18, 50),  (18, 62), (3, 21),  (18, 40)],
            ">=2018": [(15, 50), (15, 62), (3, 21),  (15, 40)]
        },
        DeptCode.CS: [(19, 49),  (19, 61), (15, 21), (19, 40)],
        DeptCode.AE: [(21, 42),  (21, 60), (9, 18), (21, 42)],
        DeptCode.CH: [(24, 42),  (24, 54), (12, 21), (24, 40)]
    }

    # (total credit of mandatory Major Course , total required credit for Dept)
    # should not change order (matches to credit_info)
    credit_for_dept_order: List[TrackType] = [
        TrackType.major, TrackType.specialized_majors, TrackType.minors, TrackType.double_majors]

    # TODO - dept_code는 기본적으로 int고 name 혹은 value / dept.code는 string
    @classmethod
    def credit_for_dept(cls: Credit, user: UserProfile, dept_code: DeptCode, track_type: TrackType) -> Tuple[int, int]:
        dept = get_dept(dept_code)
        entrace_year = int(user.student_id[:4])
        index = Credit.credit_for_dept_order.index(track_type)
        if dept.code == DeptCode.EE.name:
            assert entrace_year >= 2016  # don't support <=2015
            year_key = "2016,2017" if entrace_year in [
                2016, 2017] else ">=2018"
            return cast(Credit.Credit_Info_Exception, Credit.credit_info[dept_code])[year_key][index]
        else:
            return cast(Credit.Credit_Info, Credit.credit_info[dept_code])[index]

    # the following check order is important! high-order priority!
    # apply the strongest criteria among the possible criteria
    credit_for_track_order: List[TrackType] = [TrackType.specialized_majors,
                                               TrackType.double_majors, TrackType.major, TrackType.minors]

    # TODO - Department.code랑 DeptCode 필수 통일!
    @classmethod
    def credit_for_track(cls: Credit, user: UserProfile, track: Track) -> Dict[DeptCode, Tuple[int, int]]:
        # return credits for each dept. that require to graduate from user's info
        credit_list = {}
        assert not track.is_self_designed(), "we cannot handle yet :("
        for dept in get_all_dept():
            for track_type in Credit.credit_for_track_order:
                if track.contain_dept_as_track_type(dept, track_type):
                    credit_list[DeptCode[dept.code]] = cls.credit_for_dept(
                        user, DeptCode[dept.code], track_type)
                    break  # Stop if any type is used
        return credit_list


class Planner(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, db_index=True)
    entrance_year = models.IntegerField(db_index=True)
    # TODO add track
    

class PlannerItem(models.Model):
    class CourseType(models.TextChoices):
        MAJOR_REQUIRED  = "major_required"
        MAJOR_ELECTIVE = "major_elective"
        BASIC_REQUIRED = "basic_required"
        BASIC_ELECTIVE = "basic_elective"
        HSS_REQUIRED = "hss_required"
        HSS_ELECTIVE = "hss_elective"
        
    planner = models.ForeignKey(Planner, on_delete=models.PROTECT, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)

    is_generic = models.BooleanField
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    course_type = models.CharField(choices=CourseType.choices)
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    credit = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    def to_json(self):
        result = {
            "planner": self.planner,
            "year": self.year,
            "semester": self.semester,
            "is_generic": self.is_generic,
            "course": self.course.to_json(nested=True),
            "course_type": self.course_type,
            "department": self.department.to_json(),
            "credit": self.credit,
        }

        return result
