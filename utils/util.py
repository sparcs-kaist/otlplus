from functools import reduce


def rgetattr(object_, names, default):
    return reduce(lambda o, n: getattr(o, n, default), names, object_)


def getint(querydict, key, default=None):
    value = querydict.get(key)
    if value is None:
        return default
    else:
        return int(value)


def get_ordered_queryset(queryset, orders):
    return queryset.order_by(*orders)


def get_paginated_queryset(queryset, offset, limit, max_limit=150):
    if offset is None:
        real_offest = 0
    elif offset >= 0:
        real_offest = offset
    else:
        raise ValueError

    if limit is None:
        real_limit = max_limit
    elif 0 <= limit <= max_limit:
        real_limit = limit
    else:
        raise ValueError

    return queryset[real_offest : real_offest + real_limit]


def patch_object(object_, update_fields):
    for k, v in update_fields.items():
        if v is None:
            continue
        setattr(object_, k, v)

    object_.save()
