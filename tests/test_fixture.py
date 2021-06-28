import pytest

from tests.conftest import TestCase


@pytest.mark.django_db
@pytest.mark.usefixtures('set_course_db')
class TestFixture(TestCase):
    def test_okay(self):
        assert 1 == 1
