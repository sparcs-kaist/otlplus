
def rgetattr(object_, names, default):
    return reduce(lambda o, n: getattr(o, n, default), names, object_)


def getint(querydict, key, default=None):
    value = querydict.get(key)
    if value is None:
        return default
    else:
        return int(value)


def paginate_queryset(queryset, offset, limit, max_limit=150):
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
    