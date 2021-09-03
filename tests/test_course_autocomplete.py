from tests.conftest import TestCase


class TestCourseAutocomplete(TestCase):
    def test_not_found(self):
        response = self.request_get(None, "/api/courses/autocomplete", {"keyword": "술박스술박스"})
        assert response.data == "술박스술박스"

    def test_name_match(self):
        response = self.request_get(None, "/api/courses/autocomplete", {"keyword": "양자역학"})
        assert response.data == "양자역학 I"

    def test_name_en_match(self):
        response = self.request_get(None, "/api/courses/autocomplete", {"keyword": "Quantum Mechan"})
        assert response.data == "Quantum Mechanics I"

    def test_professor_match(self):
        response = self.request_get(None, "/api/courses/autocomplete", {"keyword": "교수_"})
        assert response.data == "교수_0"

    def test_professor_en_match(self):
        response = self.request_get(None, "/api/courses/autocomplete", {"keyword": "Professor"})
        assert response.data == "Professor_0"
