from tests.conftest import TestCase


class TestUserFeed(TestCase):
    def test_invalid_user_id(self):
        response = self.request_get(None, "/api/users/0/feeds")
        assert response.status_code == 401
