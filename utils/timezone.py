import datetime


class KST(datetime.tzinfo):
    _offset = datetime.timedelta(hours=9)
    _dst = datetime.timedelta(0)
    _name = "Asia/Seoul"

    def utcoffset(self, dt):
        return self.__class__._offset

    def dst(self, dt):
        return self.__class__._dst

    def tzname(self, dt):
        return self.__class__._name
