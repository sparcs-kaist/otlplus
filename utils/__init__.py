import os
import mimetypes
import urllib
from datetime import date, timedelta
import json
from django.http import HttpResponse
from django.core.cache import cache
from django.conf import settings


def get_choice_display(choices, key):
    for item in choices:
        if item[0] == key:
            return item[1]
    return "(None)"


def cache_with_default(key, default, timeout=300):
    """
    cache.get() 메소드에도 default 인자가 있지만, 호출 당시 이미 evaluate되므로
    항상 다음과 같은 구조를 사용해야 한다.

    value = cache.get(key)
    if value is None:
        value = calculate()
        cache.set(key, value)

    그러나 Python에서 제공되는 lambda 함수를 사용하면 인자로 넘길 때 바로
    evaluate되지 않고 명시적으로 호출해야만 하므로 cache가 있는 경우 그냥
    무시하고 없는 경우에만 호출하여 default 인자를 바로 연산값으로 사용할
    경우 보다 간결한 코드로 표현할 수 있다.
    """
    if not callable(default):
        raise TypeError("The argument default should be a callable, normally lambda function to work efficiently.")
    value = cache.get(key)
    if value is None:
        value = default()
        cache.set(key, value, timeout)
    return value


def respond_as_json(request, obj):
    output = json.dumps(obj, ensure_ascii=False, indent=4 if settings.DEBUG else 0)
    type = "application/json" if request.is_ajax() else "text/plain"
    return HttpResponse(output, mimetype=type)


def respond_as_attachment(request, file_path, original_filename, no_attach=False):
    fp = open(file_path, "rb")
    response = HttpResponse(fp.read())
    fp.close()
    type, encoding = mimetypes.guess_type(original_filename)
    if type is None:
        type = "application/octet-stream"
    response["Content-Type"] = type
    response["Content-Length"] = str(os.stat(file_path).st_size)
    if encoding is not None:
        response["Content-Encoding"] = encoding

    if not no_attach:
        # To inspect details for the below code, see http://greenbytes.de/tech/tc2231/
        if "WebKit" in request.META["HTTP_USER_AGENT"]:
            # Safari 3.0 and Chrome 2.0 accepts UTF-8 encoded string directly.
            filename_header = "filename=%s" % original_filename.encode("utf-8")
        elif "MSIE" in request.META["HTTP_USER_AGENT"]:
            # IE does not support internationalized filename at all.
            # It can only recognize internationalized URL, so we do the trick via routing rules.
            filename_header = ""
        else:
            # For others like Firefox, we follow RFC2231 (encoding extension in HTTP headers).
            filename_header = "filename*=UTF-8''%s" % urllib.quote(original_filename.encode("utf-8"))
        response["Content-Disposition"] = "attachment; " + filename_header
    return response


def date_range(start, end):
    """
    지정한 두 날짜 사이의 모든 날짜(inclusively)를 하루 단위로 돌려주는 iterator.
    """
    if not isinstance(start, date) or not isinstance(end, date):
        raise TypeError("Arguments should be python date.")

    if start > end:
        raise ValueError("Ending date should be later than starting date.")

    current = start
    one_day = timedelta(days=1)
    while True:
        yield current
        current += one_day
        if current - one_day == end:
            break
