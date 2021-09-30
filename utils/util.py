from functools import reduce
import re
from enum import Enum, auto
from typing import Tuple, List, Dict, Callable, Any, Optional, Union

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


Validator = Callable[[Any], bool]


class ParamsType(Enum):
    STR = auto()
    INT = auto()
    LIST_STR = auto()
    LIST_INT = auto()

def parse_params(
        params: QueryDict,
        config: Tuple[str, ParamsType, bool, List[Validator]]
) -> Optional[Union[str, int, List[str], List[int]]]:

    key, type_, is_required, validators = config

    if type_ == ParamsType.STR:
        value: Optional[str] = params.get(key, None)
    elif type_ == ParamsType.INT:
        value: Optional[int] = _get_int(params, key)
    elif type_ == ParamsType.LIST_STR:
        value: Optional[List[str]] = params.getlist(key, None)
    elif type_ == ParamsType.LIST_INT:
        value: Optional[List[int]] = _get_int_list(params, key)

    if is_required and (value is None):
        raise ValueError(f"Params '{key}' is marked as required but not given")

    if value is not None:
        for v in validators:
            if not v(value):
                raise ValueError(f"Params '{key}' did not pass validator: {v}")

    return value


def _get_int(querydict: Dict, key: str) -> Optional[int]:
    value = querydict.get(key, None)
    if value is None:
        return None
    else:
        return int(value)

def _get_int_list(querydict: QueryDict, key: str) -> Optional[List[int]]:
    values = querydict.getlist(key, None)
    if values is None:
        return None
    else:
        return [int(v) for v in values]


OFFSET_DEFAULT_CONFIG = ("offset", ParamsType.INT, False, [lambda offset: offset >= 0])
LIMIT_DEFAULT_CONFIG = ("limit", ParamsType.INT, False, [lambda limit: limit >= 0])

def apply_offset_and_limit(queryset: QuerySet, offset: Optional[int], limit: Optional[int],
                           max_limit: int) -> QuerySet:
    if offset is None:
        real_offest = 0
    elif offset >= 0:
        real_offest = offset
    else:
        raise ValueError

    if limit is None:
        real_limit = max_limit
    elif limit > max_limit:
        raise ValueError
    else:
        real_limit = limit

    return queryset[real_offest : real_offest + real_limit]


_PROHIBITED_FIELD_PATTERN = [
    r"\?",
    r"user", r"profile", r"owner", r"writer",
    r"__.*__"
]
ORDER_DEFAULT_CONFIG = ("order", ParamsType.LIST_STR, False, [
    lambda order: all((not re.match(p, o)) for p in _PROHIBITED_FIELD_PATTERN for o in order)
])

def apply_order(queryset: QuerySet, order: Optional[List[str]],
                default_order: list) -> QuerySet:

    if order is None:
        real_order = default_order
    else:
        real_order = order

    return queryset.order_by(*real_order).distinct()


def patch_object(object_, update_fields):
    for k, v in update_fields.items():
        if v is None:
            continue
        setattr(object_, k, v)

    object_.save()
