from datetime import time

from apps.subject.models import Lecture, ClassTime
from tests.conftest import TestCase


class TestLectureLookup(TestCase):
    def test_semester_search(self):
        def _build_request(year=None, semester=None):
            return self.request_get(
                None,
                "/api/lectures",
                {
                    "year": year,
                    "semester": semester,
                },
            )

        response = _build_request(year=2020)
        assert len(response.data) == Lecture.objects.filter(year=2020, deleted=False).count()

        response = _build_request(year=2021, semester=1)
        assert len(response.data) == Lecture.objects.filter(year=2021, semester=1, deleted=False).count()

    def test_time_range(self):
        def _build_request(day=None, begin=None, end=None):
            return self.request_get(
                None,
                "/api/lectures",
                {
                    "day": day,
                    "begin": begin,
                    "end": end,
                },
            )

        response = _build_request(None, 1, 8)
        expected_count = (
            ClassTime.objects.filter(begin__gte=time(8, 30), end__lte=time(12, 0), lecture__deleted=False)
            .values("lecture_id")
            .distinct()
            .count()
        )
        assert len(response.data) == expected_count

        response = _build_request(1)
        expected_count = ClassTime.objects.filter(day=1, lecture__deleted=False).values("lecture_id").distinct().count()
        assert len(response.data) == expected_count

        response = _build_request(2, 8, 19)
        expected_count = (
            ClassTime.objects.filter(day=2, begin__gte=time(12, 0), end__lte=time(17, 30), lecture__deleted=False)
            .values("lecture_id")
            .distinct()
            .count()
        )
        assert len(response.data) == expected_count
