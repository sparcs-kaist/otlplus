import json
import abc
import logging
import traceback

REQUEST_META_KEYS = [
    "PATH_INFO",
    "HTTP_X_SCHEME",
    "REMOTE_ADDR",
    "TZ",
    "REMOTE_HOST",
    "CONTENT_TYPE",
    "CONTENT_LENGTH",
    "HTTP_AUTHORIZATION",
    "HTTP_HOST",
    "HTTP_USER_AGENT",
    "HTTP_X_FORWARDED_FOR",
    "HTTP_X_REAL_IP",
    "HTTP_X_REQUEST_ID",
]


class BaseLogObject(metaclass=abc.ABCMeta):
    def __init__(self, request):
        self.request = request

    def format_request(self) -> dict:
        # print(self.request.META['HTTP_UUID'])
        # print(self.request.META)
        result = {
            "method": self.request.method,
            # "meta": {
            #     key.lower(): str(value)
            #     for key, value in self.request.META.items()
            #     if key in REQUEST_META_KEYS
            # },
            "UUID": self.request.META['HTTP_UUID'] if self.request.META['HTTP_UUID'] else None,
            "path": self.request.path_info,
        }

        try:
            result["data"] = {key: value for key, value in self.request.data.items()}
        except AttributeError:
            if self.request.method == "GET":
                result["data"] = self.request.GET.dict()
            elif self.request.method == "POST":
                result["data"] = self.request.POST.dict()

        try:
            result["user"] = self.request.user.username
        except AttributeError:
            result["user"] = None

        return result

    @abc.abstractmethod
    def format(self):
        pass


import json

class LogObject(BaseLogObject):
    def __init__(self, request, response):
        super(LogObject, self).__init__(request)
        self.response = response

    def format(self) -> dict:
        return {
            "request": self.format_request(),
            "response": self.format_response(),
            "duration": self.duration
        }

    def format_response(self) -> dict:
        result = {
            "status": self.response.status_code,
            # "headers": dict(self.response.items()),
            # "charset": getattr(self.response, "charset", 'utf-8'),
        }

        try:
            # If the response content is JSON, parse it correctly and avoid double escaping
            if isinstance(self.response.content, bytes):
                # Decode and load the JSON data
                result["data"] = json.loads(self.response.content.decode(self.response.charset or 'utf-8'))
            else:
                result["data"] = self.response.content
        except json.JSONDecodeError:
            # If not JSON, log as plain text
            result["data"] = self.response.content.decode(self.response.charset or 'utf-8')

        return result

    def __repr__(self):
        # Use ensure_ascii=False to properly handle non-ASCII characters in the logs
        return json.dumps(self.format(), ensure_ascii=False)


class ErrorLogObject(BaseLogObject):
    def __init__(self, request, exception):
        super(ErrorLogObject, self).__init__(request)
        self.exception = exception

    def format(self) -> dict:
        return {
            "request": self.format_request(),
            "exception": self.format_exception(self.exception),
        }

    @staticmethod
    def exception_type(exception) -> str:
        return str(type(exception)).split("'")[1]

    @staticmethod
    def format_exception(exception) -> dict:
        tb = [
            {"file": item[0], "line": item[1], "method": item[2]}
            for item in traceback.extract_tb(
                traceback.TracebackException.from_exception(exception).exc_traceback
            )
        ]
        return {
            "message": str(exception),
            "type": ErrorLogObject.exception_type(exception),
            "traceback": tb,
        }

    def __repr__(self):
        return str(self.format())
