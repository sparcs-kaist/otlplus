from datetime import time
from functools import reduce
from typing import Tuple
import operator
import datetime
import traceback

from django.core.cache import cache
from django.db import models
from django.db.models import Q
from django.utils import timezone

from utils.enum import CLASS_TYPES, WEEKDAYS


class Semester(models.Model):
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    beginning = models.DateTimeField()
    end = models.DateTimeField()

    courseDesciptionSubmission = models.DateTimeField(null=True)

    courseRegistrationPeriodStart = models.DateTimeField(null=True)
    courseRegistrationPeriodEnd = models.DateTimeField(null=True)
    # Beginning goes here in timeline
    courseAddDropPeriodEnd = models.DateTimeField(null=True)
    courseDropDeadline = models.DateTimeField(null=True)
    courseEvaluationDeadline = models.DateTimeField(null=True)
    # End goes here in timeline
    gradePosting = models.DateTimeField(null=True)

    class Meta:
        unique_together = [["year", "semester"]]

    def get_cache_key(self):
        return "semester:%d-%d" % (self.year, self.semester)

    def to_json(self):
        cache_id = self.get_cache_key()
        result_cached = cache.get(cache_id)
        if result_cached is not None:
            return result_cached

        result = {
            "year": self.year,
            "semester": self.semester,
            "beginning": self.beginning,
            "end": self.end,
            "courseDesciptionSubmission": self.courseDesciptionSubmission,
            "courseRegistrationPeriodStart": self.courseRegistrationPeriodStart,
            "courseRegistrationPeriodEnd": self.courseRegistrationPeriodEnd,
            "courseAddDropPeriodEnd": self.courseAddDropPeriodEnd,
            "courseDropDeadline": self.courseDropDeadline,
            "courseEvaluationDeadline": self.courseEvaluationDeadline,
            "gradePosting": self.gradePosting,
        }

        cache.set(cache_id, result, 60 * 60)

        return result

    # SYNC: Keep synchronized with React src/utils/semesterUtils.js getOngoingSemester()
    @classmethod
    def get_ongoing_semester(cls):
        now = timezone.now()
        try:
            ongoing_semester = cls.objects.get(beginning__lt=now, end__gt=now)
        except cls.DoesNotExist:
            return None
        except cls.MultipleObjectsReturned:
            # TODO: Use a logger instead
            print(
                "WARNING: Semester.get_ongoing_semester() catched multiple Semester instances with overlapping period."
                "Please check beginning and end fields of the instances.",
            )
            ongoing_semester = cls.objects.filter(beginning__lt=now, end__gt=now).first()
        return ongoing_semester

    @classmethod
    def get_semester_to_default_import(cls):
        now = timezone.now()
        return cls.objects.filter(courseDesciptionSubmission__lt=now) \
                          .order_by("courseDesciptionSubmission").last()

    # TODO: Change methods below to receive and return Semester class instance instead of
    #       integer type year and semester value
    #       See issue #845

    @classmethod
    def get_prev_semester(cls, year: int, semester: int) -> Tuple[int, int]:
        if semester == 1:
            return year - 1, 4
        else:
            return year, semester - 1

    @classmethod
    def get_next_semester(cls, year: int, semester: int) -> Tuple[int, int]:
        if semester == 4:
            return year + 1, 1
        else:
            return year, semester + 1

    @classmethod
    def get_offsetted_semester(cls, year: int, semester: int, offset: int) -> Tuple[int, int]:
        for _ in range(abs(offset)):
            if offset > 0:
                year, semester = Semester.get_next_semester(year, semester)
            else:
                year, semester = Semester.get_prev_semester(year, semester)
        return year, semester


class Lecture(models.Model):
    # Fetched from KAIST Scholar DB
    code = models.CharField(max_length=10, db_index=True)
    old_code = models.CharField(max_length=10, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.SmallIntegerField(db_index=True)
    department = models.ForeignKey("Department", on_delete=models.PROTECT, db_index=True)
    class_no = models.CharField(max_length=4, blank=True)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36, db_index=True)
    audience = models.IntegerField()
    credit = models.IntegerField(default=3)
    num_classes = models.IntegerField(default=3)
    num_labs = models.IntegerField(default=0)
    credit_au = models.IntegerField(default=0)
    limit = models.IntegerField(default=0)
    professors = models.ManyToManyField("Professor",
                                        related_name="lectures", blank=True, db_index=True)
    is_english = models.BooleanField()
    deleted = models.BooleanField(default=False, db_index=True)

    course = models.ForeignKey("Course", on_delete=models.PROTECT, related_name="lectures")

    # Updated by signal timetable_lecture_saved, timetable_deleted
    num_people = models.IntegerField(default=0, blank=True, null=True)

    # Updated by method update_class_title
    common_title = models.CharField(max_length=100, null=True)
    common_title_en = models.CharField(max_length=100, null=True)
    class_title = models.CharField(max_length=100, null=True)
    class_title_en = models.CharField(max_length=100, null=True)

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    review_total_weight = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    def get_cache_key(self, nested):
        return "lecture:%d:%s" % (self.id, "nested" if nested else "normal")

    def to_json(self, nested=False):
        if self.deleted:
            print("WARNING: You are serializing DELETED lecture: %s. Please check your query" % self)
            traceback.print_stack()

        cache_id = self.get_cache_key(nested)
        result_cached = cache.get(cache_id)
        if result_cached is not None:
            return result_cached

        # Don't change this into model_to_dict: for security and performance
        result = {
            "id": self.id,
            "title": self.title,
            "title_en": self.title_en,
            "course": self.course.id,
            "old_code": self.old_code,
            "class_no": self.class_no,
            "year": self.year,
            "semester": self.semester,
            "code": self.code,
            "department": self.department.id,
            "department_code": self.department.code,
            "department_name": self.department.name,
            "department_name_en": self.department.name_en,
            "type": self.type,
            "type_en": self.type_en,
            "limit": self.limit,
            "num_people": self.num_people,
            "is_english": self.is_english,
            "credit": self.credit,
            "credit_au": self.credit_au,
            "common_title": self.common_title,
            "common_title_en": self.common_title_en,
            "class_title": self.class_title,
            "class_title_en": self.class_title_en,
            "review_total_weight": self.review_total_weight,
        }

        professors = self.professors.all().order_by("professor_name")
        result.update({"professors": [p.to_json(nested=True) for p in professors]})

        if nested:
            cache.set(cache_id, result, 60 * 10)
            return result

        result.update(
            {
                "grade": self.grade,
                "load": self.load,
                "speech": self.speech,
                "num_labs": self.num_labs,
                "num_classes": self.num_classes,
                "classtimes": [ct.to_json(nested=True) for ct in self.classtimes.all()],
                "examtimes": [et.to_json(nested=True) for et in self.examtimes.all()],
            },
        )

        cache.set(cache_id, result, 60 * 10)

        return result

    def recalc_score(self):
        from apps.review.models import Review # pylint: disable=import-outside-toplevel

        reviews = Review.objects.filter(lecture__course=self.course,
                                        lecture__professors__in=self.professors.all())
        _, self.review_total_weight, sums, avgs = Review.calc_average(reviews)
        self.grade_sum, self.load_sum, self.speech_sum = sums
        self.grade, self.load, self.speech = avgs
        self.save()

    def update_class_title(self):
        # Finds logest common string from front of given strings
        def _lcs_front(lecture_titles):
            if len(lecture_titles) == 0:
                return ""
            result = ""
            for i in range(len(lecture_titles[0]), 0, -1):  # [len(ls[0]),...,2,1]
                target_substring = lecture_titles[0][0:i]
                if all(t[0:i] == target_substring for t in lecture_titles):
                    result = target_substring
                    break
            result = result.rstrip("<([{")
            return result

        # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
        def _add_title_format(lecture_list):
            if len(lecture_list) == 1:
                title = lecture_list[0].title
                if title[-1] == ">":
                    common_title = title[: title.find("<")]
                else:
                    common_title = title
            else:
                common_title = _lcs_front([lecture.title for lecture in lecture_list])

            for lecture in lecture_list:
                lecture.common_title = common_title
                if lecture.title != common_title:
                    lecture.class_title = lecture.title[len(common_title) :]
                elif len(lecture.class_no) > 0:
                    lecture.class_title = lecture.class_no
                else:
                    lecture.class_title = "A"
                lecture.save(update_fields=["common_title", "class_title"])

        # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
        def _add_title_format_en(lecture_list):
            if len(lecture_list) == 1:
                title = lecture_list[0].title_en
                if title[-1] == ">":
                    common_title = title[: title.find("<")]
                else:
                    common_title = title
            else:
                common_title = _lcs_front([lecture.title_en for lecture in lecture_list])

            for lecture in lecture_list:
                lecture.common_title_en = common_title
                if lecture.title_en != common_title:
                    lecture.class_title_en = lecture.title_en[len(common_title) :]
                elif len(lecture.class_no) > 0:
                    lecture.class_title_en = lecture.class_no
                else:
                    lecture.class_title_en = "A"
                lecture.save(update_fields=["common_title_en", "class_title_en"])

        lectures = Lecture.objects.filter(course=self.course, deleted=False,
                                          year=self.year, semester=self.semester)
        _add_title_format(lectures)
        _add_title_format_en(lectures)

    # SYNC: Keep synchronized with React src/utils/lectureUtils.js getProfessorsShortStr()
    def get_professors_short_str(self):
        professors = self.professors.all().order_by("professor_name")
        prof_name_list = [p.professor_name for p in professors]
        if len(prof_name_list) <= 2:
            return ", ".join(prof_name_list)
        return f"{prof_name_list[0]} 외 {len(prof_name_list) - 1} 명"

    @classmethod
    def get_query_for_research(cls):
        return Q(type_en__in=["Individual Study", "Thesis Study(Undergraduate)",
                              "Thesis Research(MA/phD)"])

    @classmethod
    def get_query_for_review_writable(cls):
        now = timezone.now()
        not_writable_semesters = Semester.objects.filter(Q(courseAddDropPeriodEnd__gte=now)
                                                         | Q(beginning__gte=now))
        query = reduce(operator.and_,
                       (~Q(year=s.year, semester=s.semester) for s in not_writable_semesters),
                       Q())
        return query

    def __str__(self):
        re_str = "%s(%s %s)" % (self.title, self.old_code, self.class_no)
        return re_str


class ExamTime(models.Model):
    """Lecture에 배정된 시험시간"""

    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="examtimes")
    day = models.SmallIntegerField(choices=WEEKDAYS)  # 시험요일
    begin = models.TimeField()  # hh:mm 형태의 시험시작시간 (24시간제)
    end = models.TimeField()  # hh:mm 형태의 시험시작시간 (24시간 제)

    def __str__(self):
        return "[%s] %s, %s-%s" % (
            self.lecture.code,
            self.get_day_display(),
            self.begin.strftime("%H:%M"),
            self.end.strftime("%H:%M"),
        )

    def to_json(self, nested=False):
        def _format_day(day: int) -> str:
            DAY_STR = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
            return DAY_STR[day]

        def _format_day_en(day: int) -> str:
            DAY_STR_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                          "Sunday"]
            return DAY_STR_EN[day]

        def _format_time(time_: datetime.time) -> str:
            return time_.strftime("%H:%M")

        result = {
            "day": self.day,
            "str": \
                f"{_format_day(self.day)} {_format_time(self.begin)} ~ {_format_time(self.end)}",
            "str_en": \
                f"{_format_day_en(self.day)} {_format_time(self.begin)} ~ {_format_time(self.end)}",
            "begin": self.get_begin_numeric(),
            "end": self.get_end_numeric(),
        }

        return result

    def get_begin_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 시작 시간을 반환한다."""
        begin_numeric = self.begin.hour * 60 + self.begin.minute
        return begin_numeric

    def get_end_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 종료 시간을 반환한다."""
        end_numeric = self.end.hour * 60 + self.end.minute
        return end_numeric


class ClassTime(models.Model):
    """Lecture 에 배정된강의시간, 보통 하나의  Lecture 가 여러개의 강의시간을 가진다."""

    lecture = models.ForeignKey(Lecture,
                                on_delete=models.CASCADE, related_name="classtimes", null=True)
    day = models.SmallIntegerField(choices=WEEKDAYS)  # 강의 요일
    begin = models.TimeField()  # hh:mm 형태의 강의 시작시각 (24시간제)
    end = models.TimeField()  # hh:mm 형태의 강의 끝나는 시각 (24시간 제)
    type = models.CharField(max_length=1, choices=CLASS_TYPES)  # 강의 or 실험
    building_id = models.CharField(max_length=10, blank=True, null=True)  # 건물 고유 ID
    building_full_name = models.CharField(max_length=60, blank=True,
                                          null=True)  # 건물 이름(ex> (E11)창의학습관)
    building_full_name_en = models.CharField(max_length=60, blank=True,
                                             null=True)  # 건물 이름(ex> (E11)Creative learning Bldg.)
    room_name = models.CharField(max_length=20, null=True)  # 강의실 호실(ex> 304, 1104, 1209-1, 터만홀)
    unit_time = models.SmallIntegerField(null=True)  # 수업 교시

    def to_json(self, nested=False):
        building_code, room_name, classroom, classroom_en, classroom_short, classroom_short_en = self.get_classroom_strs()

        result = {
            "building_code": building_code,
            "classroom": classroom,
            "classroom_en": classroom_en,
            "classroom_short": classroom_short,
            "classroom_short_en": classroom_short_en,
            "room_name": room_name,
            "day": self.day,
            "begin": self.get_begin_numeric(),
            "end": self.get_end_numeric(),
        }

        return result

    def get_begin_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 시작 시간을 반환한다."""
        """30분 단위로 내림한다"""
        begin_numeric = self.begin.hour * 60 + self.begin.minute
        if begin_numeric % 30 != 0:
            begin_numeric = begin_numeric - (begin_numeric % 30)
        return begin_numeric

    def get_end_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 종료 시간을 반환한다."""
        """30분 단위로 올림한다"""
        end_numeric = self.end.hour * 60 + self.end.minute
        if end_numeric % 30 != 0:
            end_numeric = end_numeric + (30 - (end_numeric % 30))
        return end_numeric
    
    def get_classroom_strs(self):
        building_full_name = self.building_full_name
        building_full_name_en = self.building_full_name_en
        # No classroom info
        if building_full_name is None or len(building_full_name) == 0:
            building_code = ""
            room_name = ""
            classroom = "정보 없음"
            classroom_en = "Unknown"
            classroom_short = "정보 없음"
            classroom_short_en = "Unknown"
        # Building name has form of "(N1) xxxxx"
        elif building_full_name[0] == "(":
            building_code = building_full_name[1 : building_full_name.find(")")]
            building_name = building_full_name[len(building_code) + 2 :]
            building_name_en = building_full_name_en[len(building_code) + 2 :]
            room_name = self.room_name if (self.room_name is not None) else ""
            classroom = "(" + building_code + ") " + building_name + " " + room_name
            classroom_en = "(" + building_code + ") " + building_name_en + " " + room_name
            classroom_short = "(" + building_code + ") " + room_name
            classroom_short_en = "(" + building_code + ") " + room_name
        # Building name has form of "xxxxx"
        else:
            building_code = ""
            room_name = self.room_name if (self.room_name is not None) else ""
            classroom = building_full_name + " " + room_name
            classroom_en = building_full_name_en + " " + room_name
            classroom_short = building_full_name + " " + room_name
            classroom_short_en = building_full_name_en + " " + room_name
        return building_code, room_name, classroom, classroom_en, classroom_short, classroom_short_en


    def get_location(self):
        if self.room_name is None:
            return "%s" % (self.building_full_name)
        try:
            int(self.room_name)
            return "%s %s호" % (self.building_full_name, self.room_name)
        except ValueError:
            return "%s %s" % (self.building_full_name, self.room_name)

    def get_location_en(self):
        if self.room_name is None:
            return "%s" % (self.building_full_name_en)
        try:
            int(self.room_name)
            return "%s %s" % (self.building_full_name_en, self.room_name)
        except ValueError:
            return "%s %s" % (self.building_full_name_en, self.room_name)

    @staticmethod
    def numeric_time_to_str(numeric_time):
        return "%s:%s" % (numeric_time // 60, numeric_time % 60)

    @staticmethod
    def numeric_time_to_obj(numeric_time):
        return time(hour=numeric_time // 60, minute=numeric_time % 60)


class Department(models.Model):
    id = models.IntegerField(primary_key=True, db_index=True)
    num_id = models.CharField(max_length=4, db_index=True)
    code = models.CharField(max_length=5, db_index=True)
    name = models.CharField(max_length=60, db_index=True)
    name_en = models.CharField(max_length=60, null=True, db_index=True)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.code

    def get_cache_key(self, nested):
        return "department:%d:%s" % (self.id, "nested" if nested else "normal")

    def to_json(self, nested=False):
        cache_id = self.get_cache_key(nested)
        result_cached = cache.get(cache_id)
        if result_cached is not None:
            return result_cached

        result = {
            "id": self.id,
            "name": self.name,
            "name_en": self.name_en,
            "code": self.code,
        }

        cache.set(cache_id, result, 60 * 30)

        return result


class Course(models.Model):
    # Fetched from KAIST Scholar DB
    old_code = models.CharField(max_length=10, db_index=True)
    department = models.ForeignKey("Department", on_delete=models.PROTECT, db_index=True)
    professors = models.ManyToManyField("Professor", db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)

    # Updated by command update_course_summary
    summury = models.CharField(max_length=4000, default="")

    related_courses_prior = models.ManyToManyField("Course", related_name="+")
    related_courses_posterior = models.ManyToManyField("Course", related_name="+")

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    review_total_weight = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    latest_written_datetime = models.DateTimeField(default=None, null=True)

    def get_cache_key(self, nested):
        return "course:%d:%s" % (self.id, "nested" if nested else "normal")

    def to_json(self, nested=False, user=None):
        def add_userspecific_data(result, user):
            # Add user read info
            if user is None or not user.is_authenticated:
                is_read = False
            else:
                try:
                    course_user = self.read_users_courseuser.get(user_profile__user=user)
                except CourseUser.DoesNotExist:
                    course_user = None

                if course_user is None:
                    is_read = False
                elif self.latest_written_datetime is None:
                    is_read = True
                else:
                    is_read = self.latest_written_datetime < course_user.latest_read_datetime

            result.update(
                {
                    "userspecific_is_read": is_read,
                },
            )

        cache_id = self.get_cache_key(nested)
        result_cached = cache.get(cache_id)
        if result_cached is not None:
            if not nested:
                add_userspecific_data(result_cached, user)
            return result_cached

        # Don't change this into model_to_dict: for security and performance
        result = {
            "id": self.id,
            "old_code": self.old_code,
            "department": self.department.to_json(nested=True),
            "type": self.type,
            "type_en": self.type_en,
            "title": self.title,
            "title_en": self.title_en,
            "summary": self.summury if len(self.summury) > 0 else "등록되지 않았습니다.",
            "review_total_weight": self.review_total_weight,
        }

        if nested:
            cache.set(cache_id, result, 60 * 10)
            return result

        result.update(
            {
                "related_courses_prior": [c.to_json(nested=True)
                                          for c in self.related_courses_prior.all()],
                "related_courses_posterior": [c.to_json(nested=True)
                                              for c in self.related_courses_posterior.all()],
                "professors": [p.to_json(nested=True)
                               for p in self.professors.all().order_by("professor_name")],
                "grade": self.grade,
                "load": self.load,
                "speech": self.speech,
            },
        )

        cache.set(cache_id, result, 60 * 10)

        add_userspecific_data(result, user)

        return result

    def recalc_score(self):
        from apps.review.models import Review # pylint: disable=import-outside-toplevel

        reviews = Review.objects.filter(lecture__course=self)
        _, self.review_total_weight, sums, avgs = Review.calc_average(reviews)
        self.grade_sum, self.load_sum, self.speech_sum = sums
        self.grade, self.load, self.speech = avgs
        self.save()

    def update_related_courses(self):
        pass

    def __str__(self):
        return "%s(%s)" % (self.title, self.old_code)


class Professor(models.Model):
    STAFF_ID = 830

    # Fetched from KAIST Scholar DB
    professor_name = models.CharField(max_length=100, db_index=True)
    professor_name_en = models.CharField(max_length=100, blank=True, null=True)
    professor_id = models.IntegerField()
    major = models.CharField(max_length=30)
    course_list = models.ManyToManyField("Course", db_index=True)

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    review_total_weight = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    def to_json(self, nested=False):
        result = {
            "name": self.professor_name,
            "name_en": self.professor_name_en,
            "professor_id": self.professor_id,
            "review_total_weight": self.review_total_weight,
        }

        if nested:
            return result

        # Add course information
        result.update(
            {
                "courses": [c.to_json(nested=True) for c in self.course_list.all()],
                "grade": self.grade,
                "load": self.load,
                "speech": self.speech,
            },
        )

        return result

    def recalc_score(self):
        from apps.review.models import Review # pylint: disable=import-outside-toplevel

        reviews = Review.objects.filter(lecture__professors=self)
        _, self.review_total_weight, sums, avgs = Review.calc_average(reviews)
        self.grade_sum, self.load_sum, self.speech_sum = sums
        self.grade, self.load, self.speech = avgs
        self.save()

    def __str__(self):
        return "%s(id:%d)" % (self.professor_name, self.professor_id)


class CourseUser(models.Model):
    course = models.ForeignKey("Course",
                               related_name="read_users_courseuser", on_delete=models.CASCADE)
    user_profile = models.ForeignKey("session.UserProfile", on_delete=models.CASCADE)
    latest_read_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["course", "user_profile"]]
