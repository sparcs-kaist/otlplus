from datetime import timedelta
import time

from . import log
from .handler import ConsoleHandler
from .log_object import ErrorLogObject, LogObject


class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        end = time.monotonic()
        duration = (end - start) * 1000  # 밀리초 단위로 변환
        log_data = LogObject(request, response)
        log_data.duration = duration
        if response.status_code == 500:
            return response
        if 400 <= response.status_code < 500:
            log.warning(log_data)
        else:
            log.info(log_data)
        return response

    @staticmethod
    def process_exception(request, exception):
        log.error(ErrorLogObject(request, exception))