from core import Dept_name, Track, TrackInfo, User


def test_error(error_msg):
    def aux(func):
        try:
            func()
        except AssertionError as error:
            expected_error = f"AssertionError('{error_msg}')"
            if repr(error) != expected_error:
                print(f"Test failed")
                print(f"occured : {repr(error)}")
                print(f"expected: AssertionError('{error_msg}')")
    return aux


if __name__ == "__main__":
    # Execute
    # python ./apps/planner/core/core.py
    # Type check
    # mypy ./apps/planner/core/core.py

    # [ user : year ] <- track => 들어야 하는 credit
    # [ user : year ] + track <- course(듣고 싶은) => 남은 credit -> 졸업 가능 여부

    @test_error('Invalid TrackInfo: major, double, minor cannot contain duplicates of each other')
    def validate_track_about_duplicate():
        trackInfo: TrackInfo = {
            "major": Dept_name["EE"],
            "double_major": set([Dept_name.ID]),
            "minor": set([Dept_name.EE]),
            "advanced_major": set([Dept_name["CS"]]),
            "self_designed": False
        }
        Track(trackInfo)

    def validate_track_about_duplicate():
        trackInfo: TrackInfo = {
            "major": Dept_name["CS"],
            "double_major": set([Dept_name.ID]),
            "minor": set([Dept_name.EE]),
            "advanced_major": set([Dept_name["CS"]]),
            "self_designed": False
        }
        track = Track(trackInfo)
        user = User(2022, track)
        print(user.required_track_credit())
        print(user.required_common_credit())
    validate_track_about_duplicate()
