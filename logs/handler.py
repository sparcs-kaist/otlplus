import json
import logging
import os
import time
import uuid
from collections import OrderedDict
from datetime import datetime
from logging import handlers

from logs.log_object import ErrorLogObject


class LogMiddlewareHandler(logging.Handler):
    @staticmethod
    def message_from_record(record):
        if (
            isinstance(record.msg, dict)
            or isinstance(record.msg, str)
            or isinstance(record.msg, int)
        ):
            message = {"raw": record.msg}
        elif isinstance(record.msg, Exception):
            message = ErrorLogObject.format_exception(record.msg)
        else:
            message = record.msg.format()
        return message

    def format(self, record):
        message = self.message_from_record(record)
        return json.dumps(
            OrderedDict(
                [
                    ("id", str(uuid.uuid4())),
                    ("level", record.levelname),
                    ("time", datetime.fromtimestamp(record.created).isoformat()),
                    *message.items(),
                ]
            ), ensure_ascii=False
        )


class ConsoleHandler(logging.StreamHandler, LogMiddlewareHandler):
    pass


class FileHandler(handlers.TimedRotatingFileHandler, LogMiddlewareHandler):
    pass


class SizedTimedRotatingFileHandler(
    handlers.TimedRotatingFileHandler, LogMiddlewareHandler
):
    """
    Handler for logging to a set of files, which switches from one file
    to the next when the current file reaches a certain size, or at certain
    timed intervals
    """

    def __init__(
        self,
        filename,
        max_bytes=0,
        backup_count=0,
        encoding=None,
        delay=0,
        when="h",
        interval=1,
        utc=False,
    ):
        handlers.TimedRotatingFileHandler.__init__(
            self, filename, when, interval, backup_count, encoding, delay, utc
        )
        self.maxBytes = max_bytes

    def shouldRollover(self, record) -> int:
        """
        Determine if rollover should occur.

        Basically, see if the supplied record would cause the file to exceed
        the size limit we have.
        """
        if self.stream is None:
            self.stream = self._open()
        if self.maxBytes > 0:
            msg = "%s\n" % self.format(record)
            # due to non-posix-compliant Windows feature
            self.stream.seek(0, 2)
            if self.stream.tell() + len(msg) >= self.maxBytes:
                return 1
        t = int(time.time())
        if t >= self.rolloverAt:
            return 1
        return 0

    def exitRollover(self):
        self.delay = True
        if self.stream:
            if self.stream.tell() > 0:
                self.doRollover()