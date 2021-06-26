import datetime
from typing import List, Dict, Optional

from django.db.models import Q, QuerySet
from django.http import QueryDict

from utils.util import rgetattr

TYPE_ACRONYMS = {
    "GR": "General Required",
    "MGC": "Mandatory General Courses",
    "BE": "Basic Elective",
    "BR": "Basic Required",
    "EG": "Elective(Graduate)",
    "HSE": "Humanities & Social Elective",
    "OE": "Other Elective",
    "ME": "Major Elective",
    "MR": "Major Required",
}
MAJOR_ACRONYMS = [
    "CE",
    "MSB",
    "ME",
    "PH",
    "BiS",
    "IE",
    "ID",
    "BS",
    "CBE",
    "MAS",
    "MS",
    "NQE",
    "HSS",
    "EE",
    "CS",
    "AE",
    "CH",
]


def filter_lectures_from_querystring(queryset: QuerySet, query_params: QueryDict) -> QuerySet:
    department = query_params.getlist("department", [])
    queryset = filter_by_department(queryset, department)

    type_ = query_params.getlist("type", [])
    queryset = filter_by_type(queryset, type_)

    level = query_params.getlist("grade", [])
    queryset = filter_by_level(queryset, level)

    group = query_params.getlist("group", [])
    queryset = filter_by_group(queryset, group)

    keyword = query_params.get("keyword", "").strip()
    queryset = filter_by_keyword(queryset, keyword)

    return queryset


def filter_by_department(queryset: QuerySet, department: List[str]) -> QuerySet:
    if department is None or len(department) == 0:
        return queryset

    if "ALL" in department:
        return queryset
    elif "ETC" in department:
        return queryset.exclude(department__code__in=(set(MAJOR_ACRONYMS) - set(department)))
    else:
        return queryset.filter(department__code__in=department)


def filter_by_type(queryset: QuerySet, types: List[str]) -> QuerySet:
    if not types or len(types) == 0:
        return queryset

    if "ALL" in types:
        return queryset
    elif "ETC" in types:
        return queryset.exclude(type_en__in=[TYPE_ACRONYMS[x] for x in TYPE_ACRONYMS if x not in types])
    else:
        return queryset.filter(type_en__in=[TYPE_ACRONYMS[x] for x in TYPE_ACRONYMS if x in types])


def filter_by_level(queryset: QuerySet, levels: List[str]) -> QuerySet:
    if not levels or len(levels) == 0:
        return queryset

    acronym_dic = {"100": "1", "200": "2", "300": "3", "400": "4"}
    if "ALL" in levels:
        return queryset
    elif "ETC" in levels:
        numbers = "".join([acronym_dic[x] for x in acronym_dic if x not in levels])
        regex = r"^[A-Za-z]+[{numbers}][0-9][0-9]$".format(numbers=numbers)
        return queryset.exclude(old_code__regex=regex)
    else:
        numbers = "".join([acronym_dic[x] for x in acronym_dic if x in levels])
        regex = r"^[A-Za-z]+[{numbers}][0-9][0-9]$".format(numbers=numbers)
        return queryset.filter(old_code__regex=regex)


def filter_by_term(queryset, term):
    if not (term and len(term)):
        return queryset

    if "ALL" in term:
        return queryset
    else:
        current_year = datetime.datetime.now().year
        return queryset.filter(lectures__year__gte=current_year - int(term))


def filter_by_group(queryset, group):
    if not group or len(group) == 0:
        return queryset

    query = Q()
    if "Basic" in group:
        group.remove("Basic")
        filter_type = ["Basic Required", "Basic Elective"]
        query |= Q(type_en__in=filter_type)
    if "Humanity" in group:
        group.remove("Humanity")
        query |= Q(type_en="Humanities & Social Elective")
    if len(group) > 0:
        filter_type = ["Major Required", "Major Elective", "Elective(Graduate)"]
        query |= Q(type_en__in=filter_type, department__code__in=group)
    return queryset.filter(query)


def filter_by_keyword(queryset: QuerySet, keyword) -> QuerySet:
    if not keyword or len(keyword) == 0:
        return queryset

    return queryset.filter(
        Q(title__icontains=keyword)
        | Q(title_en__icontains=keyword)
        | Q(old_code__iexact=keyword)
        | Q(department__name__iexact=keyword)
        | Q(department__name_en__iexact=keyword)
        | Q(professors__professor_name__icontains=keyword)
        | Q(professors__professor_name_en__icontains=keyword),
    )


def filter_by_time(queryset: QuerySet, day, begin, end) -> QuerySet:
    if day:
        queryset = queryset.filter(classtimes__day=day)
    if begin:
        queryset = queryset.filter(classtimes__begin__gte=datetime.time(int(begin) // 2 + 8, (int(begin) % 2) * 30))
    if end and (int(end) != 32):
        queryset = queryset.filter(classtimes__end__lte=datetime.time(int(end) // 2 + 8, (int(end) % 2) * 30))
    return queryset


def filter_by_semester(queryset: QuerySet, year, semester) -> QuerySet:
    if year:
        queryset = queryset.filter(year=year)
    if semester:
        queryset = queryset.filter(semester=semester)
    return queryset


def build_autocomplete_queries(course_qs: QuerySet, professor_qs: QuerySet) -> List[Dict]:
    return [
        {"queryset": course_qs, "field": ("department", "name")},
        {"queryset": course_qs, "field": ("department", "name_en")},
        {"queryset": course_qs, "field": ("title",)},
        {"queryset": course_qs, "field": ("title_en",)},
        {"queryset": professor_qs, "field": ("professor_name",)},
        {"queryset": professor_qs, "field": ("professor_name_en",)},
    ]


def match_autocomplete(keyword: str, course_qs: QuerySet, professor_qs: QuerySet) -> Optional[str]:
    query_order = build_autocomplete_queries(course_qs, professor_qs)

    for query in query_order:
        field_name = "__".join(query["field"])
        qs = query["queryset"]
        match = qs.filter(**{field_name + "__istartswith": keyword}).order_by(field_name).first()
        if match is not None:
            return rgetattr(match, query["field"], keyword)

    return None
