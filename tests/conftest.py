from typing import Optional, Union

from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseNotFound
from django.test import Client, TestCase as DjangoTestCase
from django.utils.http import urlencode


pytest_plugins = ["tests.fixtures.course"]


Response = Union[HttpResponse, HttpResponseNotFound]


class RequestMixin(object):
    def _request(self, method: str, user: Optional[User], path: str, **kwargs) -> Response:
        client = Client()
        if user:
            client.force_login(user)
        return client.__getattribute__(method)(path, **kwargs)

    def _request_with_body(self, method: str, user: Optional[User], path: str, query=None, data=None, **kwargs):
        query = {} if query is None else query
        query_string = urlencode(query, doseq=True)
        if query_string != "":
            path = f"{path}?{query_string}"
        return self._request(method, user, path, data=data, **kwargs)

    def request_get(self, user: Optional[User], path: str, query=None, redirect=False):
        return self._request("get", user, path, query=query, follow=redirect)

    def request_delete(self, user: Optional[User], path: str, query=None, redirect=False):
        return self._request("delete", user, path, query=query, follow=redirect)

    def request_post(self, user: Optional[User], path: str, query=None, data=None, redirect=False, **kwargs):
        return self._request_with_body("post", user, path, query=query, data=data, follow=redirect, **kwargs)

    def request_put(self, user: Optional[User], path: str, query=None, data=None, redirect=False, **kwargs):
        return self._request_with_body("put", user, path, query=query, data=data, follow=redirect, **kwargs)

    def request_patch(self, user: Optional[User], path: str, query=None, data=None, redirect=False, **kwargs):
        return self._request_with_body("patch", user, path, query=query, data=data, follow=redirect, **kwargs)


class TestCase(DjangoTestCase, RequestMixin):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

    def tearDown(self):
        super().tearDown()
