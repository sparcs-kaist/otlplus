from __future__ import annotations

from enum import Enum, auto
from typing import Dict, List, Set, Tuple, Union, cast

from typing_extensions import TypedDict


class Track_type(Enum):
    major = "major"
    double_major = "double_major"
    minor = "minor"
    advanced_major = "advanced_major"
    self_designed = "self_designed"


class Dept_name(Enum):
    # AE = "AE"
    # BIS = "BIS"
    # BS = "BS"
    # CBE = "CBE"
    # CE = "CE"
    # CH = "CH"
    # CS = "CS"
    # EE = "EE"
    # ID = "ID"
    # IE = "IE"
    # MAS = "MAS"
    # ME = "ME"
    # MS = "MS"
    # MSB = "MSB"
    # NQE = "NQE"
    # PH = "PH"
    # TS = "TS"
    AE = auto()  # actually 0
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


class TrackInfo(TypedDict):
    major: Dept_name
    double_major: Set[Dept_name]
    minor: Set[Dept_name]
    advanced_major: Set[Dept_name]
    self_designed: bool


# track_type_list : List[Track_type] =[track_type for track_type in Track_type]
# Dept_name_list : List[Dept_name] =[Dept_name for Dept_name in Dept_name]


class Track():
    def __init__(self, trackInfo: TrackInfo):
        # need to care Freshman as 'FRS = Fresh'

        mj = set([trackInfo["major"]])
        dm = trackInfo["double_major"]
        mn = trackInfo["minor"]
        am = trackInfo["advanced_major"]
        sd: bool = trackInfo["self_designed"]

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
        assert not (Dept_name.MSB in am), \
            "Invalid TrackInfo: MSB cannot be advanced_major"

        self.major = mj
        self.advanced_major = am
        self.minor = mn
        self.double_major = dm
        self.self_designed = sd

    def is_self_designed(self) -> bool:
        return self.self_designed

    def contain_dept_as_track_type(self, dept: Department, track_type: Track_type) -> bool:
        if (self.self_designed and track_type != Track_type.major):
            return False
        else:
            return dept.name in getattr(self, track_type.value)


class Department():
    # (total credit of mandatory Major Course , total required credit for Dept)
    credit_info_order: List[Track_type] = [
        Track_type.major, Track_type.advanced_major, Track_type.minor, Track_type.double_major]
    # should not change order (matches to credit_info)

    Credit_Info = List[Tuple[int, int]]
    Credit_Info_Exception = Dict[str, Credit_Info]
    credit_info: Dict[Dept_name, Union[Credit_Info, Credit_Info_Exception]] = {
        Dept_name.CE: [(12, 45), (12, 57), (12, 18), (12, 40)],
        Dept_name.ME: [(12, 48), (12, 63), (6, 21), (12, 40)],
        # Impossible for MSB as advanced_major
        Dept_name.MSB: [(9, 48), (0, 0), (6, 18), (6, 40)],
        Dept_name.PH: [(19, 43),  (19, 55),  (6, 18),  (19, 40)],
        Dept_name.BIS: [(14, 44), (14, 56), (14, 18), (14, 40)],
        Dept_name.ID: [(15, 45), (15, 57), (9, 18), (15, 40)],
        Dept_name.IE: [(24, 45), (24, 57), (0, 18), (24, 40)],
        Dept_name.BS: [(18, 42),  (18, 54), (12, 21), (18, 40)],
        Dept_name.CBE: [(21, 42), (21, 54), (9, 18),  (21, 42)],
        Dept_name.MAS: [(0, 42), (0, 55), (0, 18), (0, 40)],
        Dept_name.MS: [(18, 42), (18, 57),  (9, 18), (18, 40)],
        Dept_name.NQE: [(25, 43), (25, 55), (15, 21), (25, 40)],
        Dept_name.TS: [(21, 42), (21, 54), (18, 18), (21, 42)],
        Dept_name.EE: {
            "2016, 2017": [(18, 50),  (18, 62), (3, 21),  (18, 40)],
            ">=2018": [(15, 50), (15, 62), (3, 21),  (15, 40)]
        },
        Dept_name.CS: [(19, 49),  (19, 61), (15, 21), (19, 40)],
        Dept_name.AE: [(21, 42),  (21, 60), (9, 18), (21, 42)],
        Dept_name.CH: [(24, 42),  (24, 54), (12, 21), (24, 40)]
    }

    def __init__(self, name: Dept_name):
        self.name: Dept_name = name
        self.dept_credit_info = Department.credit_info[self.name]
        #  Union[Department.Credit_Info, Department.Credit_Info_Exception]

    def credit_for_track_type(self, user: User, track_type: Track_type) -> Tuple[int, int]:
        index = Department.credit_info_order.index(track_type)
        if self.name == Dept_name.EE:
            assert user.year >= 2016  # don't support <=2015
            year_key = "2016,2017" if user.year in [2016, 2017] else ">=2018"
            return cast(Department.Credit_Info_Exception, self.dept_credit_info)[year_key][index]
        else:
            return cast(Department.Credit_Info, self.dept_credit_info)[index]


dept_list: List[Department] = [Department(name) for name in Dept_name]
# instance 말고 static method로 바꿔도 될 것 같다; data repr 바꾼다고 생각하기 => filter, view?


class User:
    # the following check order is important! high-order priority!
    # apply the strongest criteria among the possible criteria
    track_type_order: List[Track_type] = [Track_type.advanced_major,
                                          Track_type.double_major, Track_type.major, Track_type.minor]

    def __init__(self, entrance_year: int, graduation_track: Track):
        self.year = entrance_year
        self.track = graduation_track

    def get_track(self) -> Track:
        return self.track

    def required_track_credit(self) -> Dict[Dept_name, Tuple[int, int]]:
        # return credits for each dept. that require to graduate from user's info
        credit_list = {}
        assert not self.track.is_self_designed(), "we cannot handle yet :("
        for dept in dept_list:
            for track_type in User.track_type_order:
                if self.track.contain_dept_as_track_type(dept, track_type):
                    credit_list[dept.name] = dept.credit_for_track_type(
                        self, track_type)
                    break  # Stop if any type is used
        return credit_list