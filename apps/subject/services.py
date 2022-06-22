import datetime
from typing import List, Dict, Optional

from django.db.models import Q, QuerySet, Value
from django.db.models.functions import Replace
from django.http import QueryDict
from django.utils import timezone

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
    "TS",
]


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
        unselected_types = [TYPE_ACRONYMS[x] for x in TYPE_ACRONYMS if x not in types]
        return queryset.exclude(type_en__in=unselected_types)
    else:
        selected_types = [TYPE_ACRONYMS[x] for x in TYPE_ACRONYMS if x in types]
        return queryset.filter(type_en__in=selected_types)


def filter_by_level(queryset: QuerySet, levels: Optional[List[str]]) -> QuerySet:
    if (levels is None) or (len(levels) == 0):
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


def filter_by_term(queryset: QuerySet, term: Optional[List[str]]) -> QuerySet:
    if (term is None) or (len(term) == 0):
        return queryset

    if "ALL" in term:
        return queryset
    else:
        current_year = timezone.now().year
        return queryset.filter(lectures__year__gte=current_year - int(term))


def filter_by_group(queryset: QuerySet, group: Optional[List[str]]) -> QuerySet:
    if (group is None) or (len(group) == 0):
        return queryset

    query = Q()
    if "Basic" in group:
        group.remove("Basic")
        filter_type = ["Basic Required", "Basic Elective"]
        query |= Q(type_en__in=filter_type)
    if "Humanity" in group:
        group.remove("Humanity")
        query |= Q(type_en__startswith="Humanities & Social Elective")
    if len(group) > 0:
        filter_type = ["Major Required", "Major Elective", "Elective(Graduate)"]
        query |= Q(type_en__in=filter_type, department__code__in=group)
    return queryset.filter(query)


def filter_by_keyword(queryset: QuerySet, keyword: Optional[str]) -> QuerySet:
    if keyword is None:
        return queryset

    keyword = keyword.strip()
    keyword_space_removed = keyword.replace(' ', '')

    if len(keyword) == 0:
        return queryset

    return queryset.annotate(
        title_space_removed=Replace('title', Value(' '), Value('')),
        title_en_space_removed=Replace('title_en', Value(' '), Value(''))
    ).filter(
        Q(title_space_removed__icontains=keyword_space_removed)
        | Q(title_en_space_removed__icontains=keyword_space_removed)
        | Q(old_code__istartswith=keyword)
        | Q(department__name__iexact=keyword)
        | Q(department__name_en__iexact=keyword)
        | Q(professors__professor_name__icontains=keyword)
        | Q(professors__professor_name_en__icontains=keyword),
    )


def filter_by_time(queryset: QuerySet, day: Optional[int], begin: Optional[int],
                   end:Optional[int]) -> QuerySet:
    time_query = Q()
    if day is not None:
        time_query &= Q(classtimes__day=day)
    if begin is not None:
        begin_hour = int(begin) // 2 + 8
        begin_minute = (int(begin) % 2) * 30
        time_query &= Q(classtimes__begin__gte=datetime.time(begin_hour, begin_minute))
    if (end is not None) and (end != 32):
        end_hour = int(end) // 2 + 8
        end_minute = (int(end) % 2) * 30
        time_query &= Q(classtimes__end__lte=datetime.time(end_hour, end_minute))
    return queryset.filter(time_query)


def filter_by_semester(queryset: QuerySet, year: Optional[int], semester: Optional[int]) -> QuerySet:
    if year is not None:
        queryset = queryset.filter(year=year)
    if semester is not None:
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
