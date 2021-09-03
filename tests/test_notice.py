from datetime import datetime, timedelta

import pytest
import pytz

from tests.conftest import TestCase


@pytest.mark.usefixtures("use_notice")
class TestNotice(TestCase):
    def test_get_all(self):
        response = self.request_get(None, "/api/notices")
        assert response.status_code == 200
        assert len(response.data) == 6

    def test_range(self):
        center_time = pytz.timezone("Asia/Seoul").localize(datetime(2018, 10, 29, 12, 1, 8))
        offset_edge = center_time - timedelta(days=1)
        offset_center = center_time + timedelta(hours=16)
        offset_outside = center_time + timedelta(weeks=4)

        response = self.request_get(None, "/api/notices", {"time": offset_edge.strftime("%Y-%m-%d %H:%M:%S%z")})
        assert len(response.data) == 3
        response = self.request_get(None, "/api/notices", {"time": offset_center.strftime("%Y-%m-%d %H:%M:%S%z")})
        assert len(response.data) == 2
        response = self.request_get(None, "/api/notices", {"time": offset_outside.strftime("%Y-%m-%d %H:%M:%S%z")})
        assert len(response.data) == 0
