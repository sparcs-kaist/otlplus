from datetime import datetime, timedelta

import pytz

from apps.subject.models import Semester
from tests.conftest import TestCase


class TestCourseLookup(TestCase):
    @classmethod
    def setUp(cls):
        super().setUpClass()
        values = [
            {"year": 2020, "semester": 1},
            {"year": 2019, "semester": 2},
            {"year": 2019, "semester": 4},
            {"year": 2020, "semester": 2},
            {"year": 2020, "semester": 4},
            {"year": 2019, "semester": 3},
            {"year": 2019, "semester": 1},
            {"year": 2020, "semester": 3},
        ]
        now = pytz.timezone("Asia/Seoul").localize(datetime(2018, 10, 29, 12, 1, 8))
        Semester.objects.bulk_create(
            [
                Semester(year=args["year"], semester=args["semester"], beginning=now, end=(now + timedelta(days=1)))
                for args in values
            ]
        )

    def tearDown(self):
        super().tearDown()
        Semester.objects.filter(year__gte=2019, year__lte=2020).delete()

    def test_schema(self):
        pass

    def test_type_search(self):
        response = self.request_get(None, "/api/semesters")
        semesters = response.data
        assert len(semesters) == 8
        for i in range(len(semesters) - 1):
            key_now = semesters[i]["year"] * 4 + semesters[i]["semester"]
            key_next = semesters[i + 1]["year"] * 4 + semesters[i + 1]["semester"]
            assert key_now < key_next
        for semester in semesters:
            assert semester["beginning"] == "2018-10-29T03:01:08Z"
            assert semester["end"] == "2018-10-30T03:01:08Z"
