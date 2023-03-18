import csv
from datetime import datetime
import json
import pytest
from os import path

from django.db import transaction
from utils.timezone import KST

from apps.subject.models import Department, Course, Lecture, Professor, ClassTime, ExamTime


def _open_path(filename: str):
    return open(path.join(path.dirname(__file__), "data", filename), "r", encoding="UTF-8")


def _import_professors():
    id_map = []
    professor_id_map = dict()
    with _open_path("subject_professor.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        instances = []
        for row in reader:
            instances.append(Professor(**{header[index]: row[index] for index in range(1, len(header))}))
            id_map.append(row[0])
        Professor.objects.bulk_create(instances)
    for index, item in enumerate(Professor.objects.all().order_by("id")):
        professor_id_map[id_map[index]] = item
    return professor_id_map


def _import_departments():
    with _open_path("subject_department.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        instances = [Department(**{header[index]: row[index] for index in range(1, len(header))}) for row in reader]
        Department.objects.bulk_create(instances)
    department_map = dict()
    for department in Department.objects.filter(visible=True):
        department_map[department.code] = department
    return department_map


def _import_courses(department_map):
    instances = []
    course_id_map = dict()
    id_map = []
    with _open_path("subject_course.json") as file:
        json_data = json.load(file)
        # id is ordered
        for item in json_data:
            item["department"] = department_map[item["department_code"]]
            del item["department_code"]
            del item["department_id"]
            id_map.append(item["id"])
            del item["id"]
            if item["latest_written_datetime"] is not None:
                item["latest_written_datetime"] = datetime.strptime(
                    item["latest_written_datetime"], "%Y-%m-%d %H:%M:%S"
                ).replace(tzinfo=KST())
            instances.append(Course(**item))
        Course.objects.bulk_create(instances)
    for index, item in enumerate(Course.objects.all().order_by("id")):
        course_id_map[id_map[index]] = item
    return course_id_map


def _import_lectures(course_id_map):
    instances = []
    lecture_id_map = dict()
    id_map = []
    with _open_path("subject_lecture.json") as file:
        json_data = json.load(file)
        for item in json_data:
            assert item["course_id"] in course_id_map
            course = course_id_map[item["course_id"]]
            assert course is not None and course.id is not None
            item["course_id"] = course.id
            item["department_id"] = course.department.id
            id_map.append(item["id"])
            del item["id"]
            instances.append(Lecture(**item))
        Lecture.objects.bulk_create(instances)
    for index, item in enumerate(Lecture.objects.all().order_by("id")):
        lecture_id_map[id_map[index]] = item
    return lecture_id_map


def _import_class_time(lecture_id_map):
    instances = []
    with _open_path("subject_classtime.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            kwargs = {header[index]: row[index] for index in range(len(header))}
            kwargs["lecture_id"] = lecture_id_map[int(kwargs["lecture_id"])].id
            instances.append(ClassTime(**kwargs))
    ClassTime.objects.bulk_create(instances)


def _import_exam_time(lecture_id_map):
    instances = []
    with _open_path("subject_examtime.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            kwargs = {header[index]: row[index] for index in range(len(header))}
            kwargs["lecture_id"] = lecture_id_map[int(kwargs["lecture_id"])].id
            instances.append(ExamTime(**kwargs))
    ExamTime.objects.bulk_create(instances)


def _import_lecture_professor_m2m(lecture_id_map, professor_id_map):
    instances = []
    with _open_path("subject_lecture_professors.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            kwargs = {header[index]: row[index] for index in range(len(header))}
            kwargs["lecture_id"] = lecture_id_map[int(kwargs["lecture_id"])].id
            kwargs["professor_id"] = professor_id_map[kwargs["professor_id"]].id
            instances.append(Lecture.professors.through(**kwargs))
    Lecture.professors.through.objects.bulk_create(instances)


def _import_course_professor_m2m(course_id_map, professor_id_map):
    instances = []
    with _open_path("subject_course_professors.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            kwargs = {header[index]: row[index] for index in range(len(header))}
            kwargs["course_id"] = course_id_map[int(kwargs["course_id"])].id
            kwargs["professor_id"] = professor_id_map[kwargs["professor_id"]].id
            instances.append(Course.professors.through(**kwargs))
    Course.professors.through.objects.bulk_create(instances)

    instances = []
    with _open_path("subject_professor_course_list.csv") as file:
        reader = csv.reader(file)
        header = next(reader, None)
        for row in reader:
            kwargs = {header[index]: row[index] for index in range(len(header))}
            kwargs["course_id"] = course_id_map[int(kwargs["course_id"])].id
            kwargs["professor_id"] = professor_id_map[kwargs["professor_id"]].id
            instances.append(Professor.course_list.through(**kwargs))
    Professor.course_list.through.objects.bulk_create(instances)


def _import_course_data():
    department_map = _import_departments()
    professor_id_map = _import_professors()
    course_id_map = _import_courses(department_map)
    lecture_id_map = _import_lectures(course_id_map)
    _import_class_time(lecture_id_map)
    _import_exam_time(lecture_id_map)
    _import_lecture_professor_m2m(lecture_id_map, professor_id_map)
    _import_course_professor_m2m(course_id_map, professor_id_map)


@pytest.fixture(scope="session")
def initial_test_data(django_db_setup, django_db_blocker):
    """
    Allow DB access in session-scoped fixture.
    https://github.com/pytest-dev/pytest-django/issues/243#issuecomment-457956838
    """
    with django_db_blocker.unblock():
        # Wrap in try + atomic block to do non crashing rollback
        try:
            with transaction.atomic():
                yield
                raise Exception
        except Exception:
            pass


@pytest.fixture(scope="session", autouse=True)
@pytest.mark.django_db
def set_course_db(initial_test_data):
    _import_course_data()
