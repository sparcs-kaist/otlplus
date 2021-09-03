from datetime import datetime

import pytz
from django.db.models import Q

from apps.subject.models import Course, Lecture
from tests.conftest import TestCase


TYPE_ACRONYMS = [
    "General Required",
    "Mandatory General Courses",
    "Basic Elective",
    "Basic Required",
    "Elective(Graduate)",
    "Humanities & Social Elective",
    "Other Elective",
    "Major Elective",
    "Major Required",
]


class TestCourseLookup(TestCase):
    def test_schema(self):
        pass

    def test_type_search(self):
        def _build_request(type_value, keyword=""):
            return self.request_get(
                None,
                "/api/courses",
                {
                    "keyword": keyword,
                    "type": type_value,
                    "department": "ALL",
                    "grade": "ALL",
                    "term": "ALL",
                },
            )

        response = _build_request("BR")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(type_en="Basic Required").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request(["BR", "BE"])
        assert response.status_code == 200
        expected_codes = set(
            [
                item["old_code"]
                for item in Course.objects.filter(Q(type_en="Basic Required") | Q(type_en="Basic Elective")).values(
                    "old_code"
                )
            ]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request("ETC")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(~Q(type_en__in=TYPE_ACRONYMS)).values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request("ALL", keyword="CS3")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(old_code__contains="CS3").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request(None, keyword="CS3")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(old_code__contains="CS3").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

    def test_department_search(self):
        response = self.request_get(None, "/api/courses", {"department": "ALL"})
        assert len(response.data) == Course.objects.count()

        response = self.request_get(None, "/api/courses", {"department": "ALL"})
        assert len(response.data) == Course.objects.count()

        response = self.request_get(None, "/api/courses", {"department": "CS"})
        assert len(response.data) == Course.objects.filter(department__code="CS").count()

        response = self.request_get(None, "/api/courses", {"department": "ETC"})
        assert len(response.data) == 36

    def test_level_search(self):
        def _build_request(grade, department="ALL"):
            return self.request_get(
                None,
                "/api/courses",
                {
                    "department": department,
                    "grade": grade,
                    "term": "ALL",
                },
            )

        response = _build_request("ETC", department="CE")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(old_code__istartswith="CE5").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request(["100", "200"], department="CE")
        assert response.status_code == 200
        expected_codes = {"CE101", "CE208"}
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request("ALL", department="AE")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(department__code="AE").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

        response = _build_request(None, department="CS")
        assert response.status_code == 200
        expected_codes = set(
            [item["old_code"] for item in Course.objects.filter(department__code="CS").values("old_code")]
        )
        actual_codes = set([item["old_code"] for item in response.data])
        assert expected_codes == actual_codes

    def test_term_search(self):
        response = self.request_get(None, "/api/courses", {"department": "CS"})
        assert len(response.data) == Course.objects.filter(department__code="CS").count()

        response = self.request_get(None, "/api/courses", {"department": "CS", "term": "ALL"})
        assert len(response.data) == Course.objects.filter(department__code="CS").count()

        current_year = pytz.timezone("Asia/Seoul").localize(datetime.now()).year
        response = self.request_get(None, "/api/courses", {"term": current_year - 2020})
        assert len(response.data) == Lecture.objects.filter(year__gte=2020).values("course_id").distinct().count()

    def test_group_search(self):
        response = self.request_get(None, "/api/courses", {"group": "Basic"})
        assert len(response.data) == Course.objects.filter(type_en__in=["Basic Required", "Basic Elective"]).count()

        response = self.request_get(None, "/api/courses", {"group": "Humanity"})
        assert len(response.data) == Course.objects.filter(type_en="Humanities & Social Elective").count()

        # TODO: 세미나 과목들은 포함되지 않음, (UX 관점에서) 올바른 작동인지 고민 필요
        response = self.request_get(None, "/api/courses", {"group": "CS"})
        assert len(response.data) == 3  # CS330, CS492, CS592
