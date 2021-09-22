from functools import reduce

from django.db.models import QuerySet
from django.http import QueryDict


def rgetattr(object_, names, default):
    return reduce(lambda o, n: getattr(o, n, default), names, object_)


def getint(querydict, key, default=None):
    value = querydict.get(key)
    if value is None:
        return default
    else:
        return int(value)


def apply_offset_and_limit(queryset: QuerySet, params: QueryDict, max_limit: int = 150) -> QuerySet:
    offset = getint(params, "offset", None)
    if offset is None:
        real_offest = 0
    elif offset >= 0:
        real_offest = offset
    else:
        raise ValueError

    limit = getint(params, "limit", None)
    if limit is None:
        real_limit = max_limit
    elif 0 <= limit <= max_limit:
        real_limit = limit
    else:
        raise ValueError

    return queryset[real_offest : real_offest + real_limit]


def apply_order(queryset: QuerySet, params: QueryDict, default_order: list = []) -> QuerySet:
    order = params.getlist("order", default_order)
    return queryset.order_by(*order).distinct()


def patch_object(object_, update_fields):
    for k, v in update_fields.items():
        if v is None:
            continue
        setattr(object_, k, v)

    object_.save()
