from datetime import timedelta, datetime

import pytest
import pytz
from django.utils import timezone

from apps.support.models import Notice


@pytest.fixture(scope="class")
def use_notice():
    center_time = pytz.timezone("Asia/Seoul").localize(datetime(2018, 10, 29, 12, 1, 8))
    for i in range(-2, 3):
        Notice(
            start_time=center_time+timedelta(days=i),
            end_time=center_time+timedelta(days=i+1),
            title=f"Notice {i+3}",
            content="foo",
        ).save()
    Notice(
        start_time=center_time-timedelta(weeks=1),
        end_time=center_time+timedelta(weeks=1),
        title="Notice",
        content="wide range"
    ).save()
