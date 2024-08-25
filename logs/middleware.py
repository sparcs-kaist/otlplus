from . import log
from .handler import ConsoleHandler
from .log_object import ErrorLogObject, LogObject


class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code == 500:
            return response
        if 400 <= response.status_code < 500:
            log.warning(LogObject(request, response))
        else:
            log.info(LogObject(request, response))
        return response

    @staticmethod
    def process_exception(request, exception):
        log.error(ErrorLogObject(request, exception))