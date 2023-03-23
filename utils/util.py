from functools import reduce
import re
from enum import Enum, auto
from typing import Tuple, List, Dict, Callable, Any, Optional, Union
import json

from django.db.models import QuerySet
from django.http import QueryDict


def rgetattr(object_, names, default):
    return reduce(lambda o, n: getattr(o, n, default), names, object_)


class ParseType(Enum):
    STR = auto()
    INT = auto()
    LIST_STR = auto()
    LIST_INT = auto()


Validator = Callable[[Any], bool]
ParseConfig = Tuple[str, ParseType, bool, List[Validator]]
ParseResult = Optional[Union[str, int, List[str], List[int]]]


def parse_params(
        params: QueryDict,
        configs: List[ParseConfig]
) -> List[ParseResult]:
    return [_parse_entry(params, c) for c in configs]


def parse_body(
        body: bytes,
        configs: List[ParseConfig]
) -> List[ParseResult]:
    body_json: Dict = json.loads(body.decode("utf-8"))
    return [_parse_entry(body_json, c) for c in configs]


def _parse_entry(
        dict_: Union[QueryDict, Dict],
        config: ParseConfig
) -> ParseResult:

    key, type_, is_required, validators = config

    if type_ == ParseType.STR:
        value: Optional[str] = dict_.get(key, None)
    elif type_ == ParseType.INT:
        value: Optional[int] = _get_int(dict_, key) \
                               if isinstance(dict_, QueryDict) \
                               else dict_.get(key, None)
    elif type_ == ParseType.LIST_STR:
        value: Optional[List[str]] = dict_.getlist(key, None) \
                                     if isinstance(dict_, QueryDict) \
                                     else dict_.get(key, None)
    elif type_ == ParseType.LIST_INT:
        value: Optional[List[int]] = _get_int_list(dict_, key) \
                                     if isinstance(dict_, QueryDict) \
                                     else dict_.get(key, None)

    if is_required and (value is None):
        raise ValueError(f"Body '{key}' is marked as required but not given")

    if value is not None:
        for v in validators:
            if not v(value):
                raise ValueError(f"Body '{key}' did not pass validator: {v}")

    return value


def _get_int(querydict: QueryDict, key: str) -> Optional[int]:
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


OFFSET_DEFAULT_CONFIG = ("offset", ParseType.INT, False, [lambda offset: offset >= 0])
LIMIT_DEFAULT_CONFIG = ("limit", ParseType.INT, False, [lambda limit: limit >= 0])

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
ORDER_DEFAULT_CONFIG = ("order", ParseType.LIST_STR, False, [
    lambda order: all((not re.match(p, o)) for p in _PROHIBITED_FIELD_PATTERN for o in order)
])

def apply_order(queryset: QuerySet, order: Optional[List[str]],
                default_order: list) -> QuerySet:

    if order is None or len(order) == 0:
        real_order = default_order
    else:
        real_order = order

    return queryset.order_by(*real_order).distinct()


def patch_object(object_, update_fields):
    for k, v in update_fields.items():
        if v is None:
            continue
        elif isinstance(v, (list, QuerySet)):
            getattr(object_, k).clear()
            getattr(object_, k).add(*v)
        else:
            setattr(object_, k, v)

    object_.save()
