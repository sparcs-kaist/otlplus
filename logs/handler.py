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


    def doRollover(self):
        """
        do a rollover; in this case, a date/time stamp is appended to the filename
        when the rollover happens.  However, you want the file to be named for the
        start of the interval, not the current time.  If there is a backup count,
        then we have to get a list of matching filenames, sort them and remove
        the one with the oldest suffix.
        """
        if self.stream:
            self.stream.close()
            self.stream = None
        # get the time that this sequence started at and make it a TimeTuple
        currentTime = int(time.time())
        dstNow = time.localtime(currentTime)[-1]
        t = self.rolloverAt - self.interval
        self.baseFilename =  os.path.abspath(os.fspath(os.path.join('/var/www/otlplus/logs/', f'response-{datetime.now().strftime("%Y-%m-%d")}.log')))
        if self.utc:
            timeTuple = time.gmtime(t)
        else:
            timeTuple = time.localtime(t)
            dstThen = timeTuple[-1]
            if dstNow != dstThen:
                if dstNow:
                    addend = 3600
                else:
                    addend = -3600
                timeTuple = time.localtime(t + addend)
        dfn = self.rotation_filename(self.baseFilename + "." +
                                     time.strftime(self.suffix, timeTuple))
        if os.path.exists(dfn):
            os.remove(dfn)
        self.rotate(self.baseFilename, dfn)
        if self.backupCount > 0:
            for s in self.getFilesToDelete():
                os.remove(s)
        if not self.delay:
            self.stream = self._open()
        newRolloverAt = self.computeRollover(currentTime)
        while newRolloverAt <= currentTime:
            newRolloverAt = newRolloverAt + self.interval
        #If DST changes and midnight or weekly rollover, adjust for this.
        if (self.when == 'MIDNIGHT' or self.when.startswith('W')) and not self.utc:
            dstAtRollover = time.localtime(newRolloverAt)[-1]
            if dstNow != dstAtRollover:
                if not dstNow:  # DST kicks in before next rollover, so we need to deduct an hour
                    addend = -3600
                else:           # DST bows out before next rollover, so we need to add an hour
                    addend = 3600
                newRolloverAt += addend
        self.rolloverAt = newRolloverAt

    def exitRollover(self):
        self.delay = True
        if self.stream:
            if self.stream.tell() > 0:
                self.doRollover()