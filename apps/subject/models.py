#-*- coding: utf-8 -*-
from django.db import models
from django.db.models import Q
from django.core.cache import cache
from utils.enum import * #for enum type (for choices)
from datetime import date, time
import datetime
import operator


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
        unique_together = [['year', 'semester']]

    def getCacheKey(self):
        return "semester:%d-%d" % (self.year, self.semester)

    def toJson(self) :
        cache_id = self.getCacheKey()
        result_cached = cache.get(cache_id)
        if result_cached != None:
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

    # Keep synchronozed with React src/common/semesterFunctions.js getOngoingSemester()
    @classmethod
    def getOngoingSemester(cls):
        now = datetime.datetime.now()
        try:
            ongoingSemester = cls.objects.get(beginning__lt=now, end__gt=now)
        except cls.DoesNotExist:
            return None
        except cls.MultipleObjectsReturned:
            print("WARNING: Semester.getOngoingSemester() catched multiple Semester instances with overlapping period. Please check beginning and end fields of the instances.")
            ongoingSemester = cls.objects.filter(beginning__lt=now, end__gt=now).first()
        return ongoingSemester

    @classmethod
    def getImportingSemester(cls):
        now = datetime.datetime.now()
        return cls.objects \
            .filter(courseDesciptionSubmission__lt=now) \
            .order_by('courseDesciptionSubmission') \
            .last()


class Lecture(models.Model):
    # Fetched from KAIST Scholar DB
    code = models.CharField(max_length=10, db_index=True)
    old_code = models.CharField(max_length=10, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.SmallIntegerField(db_index=True)
    department = models.ForeignKey('Department', on_delete=models.PROTECT, db_index=True)
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
    professors = models.ManyToManyField('Professor', related_name='lectures', blank=True, db_index=True)
    is_english = models.BooleanField()
    deleted = models.BooleanField(default=False, db_index=True)

    course = models.ForeignKey('Course', on_delete=models.PROTECT, related_name='lectures')

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
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    review_num = models.IntegerField(default=0)

    def getCacheKey(self, nested):
        return "lecture:%d:%s" % (self.id, 'nested' if nested else 'normal')

    def toJson(self, nested=False):
        if self.deleted:
            print("WARNING: You are serializing DELETED lecture: %s. Please check your query" % self)

        cache_id = self.getCacheKey(nested)
        result_cached = cache.get(cache_id)
        if result_cached != None:
            return result_cached

        # Don't change this into model_to_dict: for security and performance
        result = {"id": self.id,
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
                "review_num": self.review_num,
        }

        professors = self.professors.all().order_by('professor_name')
        result.update({
            'professors': [p.toJson(nested=True) for p in professors]
        })
        
        if nested:
            cache.set(cache_id, result, 60 * 10)
            return result

        result.update({
            'grade': self.grade,
            'load': self.load,
            'speech': self.speech,
            'classtimes': [ct.toJson(nested=True) for ct in self.classtimes.all()],
            'examtimes': [et.toJson(nested=True) for et in self.examtimes.all()],
        })

        cache.set(cache_id, result, 60 * 10)

        return result

    def recalc_score(self):
        from apps.review.models import Review
        reviews = Review.objects.filter(lecture__course=self.course,
                                        lecture__professors__in=self.professors.all())
        self.review_num = sum((r.like+1) for r in reviews)
        self.grade_sum = sum((r.like+1)*r.grade*3 for r in reviews)
        self.load_sum = sum((r.like+1)*r.load*3 for r in reviews)
        self.speech_sum = sum((r.like+1)*r.speech*3 for r in reviews)
        self.avg_update()
        self.save()

    def avg_update(self):
        if self.review_num>0:
            self.grade = (self.grade_sum + 0.0)/self.review_num
            self.load = (self.load_sum + 0.0)/self.review_num
            self.speech = (self.speech_sum + 0.0)/self.review_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
        self.save()

    def update_class_title(self):
        # Finds logest common string from front of given strings
        def _lcs_front(ls):
            if len(ls)==0:
              return ""
            result = ""
            for i in range(len(ls[0]), 0, -1): # [len(ls[0]),...,2,1]
              flag = True
              for l in ls:
                if l[0:i] != ls[0][0:i]:
                  flag = False
              if flag:
                result = l[0:i]
                break
            while (len(result) > 0) and (result[-1] in ['<', '(', '[', '{']):
              result = result[:-1]
            return result

        # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
        def _add_title_format(lectures):
            if len (lectures) == 1:
              title = lectures[0].title
              if title[-1] == '>':
                common_title = title[:title.find('<')]
              else:
                common_title = title
            else:
              common_title = _lcs_front([l.title for l in lectures])

            for l in lectures:
              l.common_title = common_title
              if l.title != common_title:
                l.class_title = l.title[len(common_title):]
              elif len(l.class_no) > 0:
                l.class_title = l.class_no
              else:
                l.class_title = u'A'
              l.save(update_fields=["common_title", "class_title"])

        # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
        def _add_title_format_en(lectures):
            if len (lectures) == 1:
              title = lectures[0].title_en
              if title[-1] == '>':
                common_title = title[:title.find('<')]
              else:
                common_title = title
            else:
              common_title = _lcs_front([l.title_en for l in lectures])

            for l in lectures:
              l.common_title_en = common_title
              if l.title_en != common_title:
                l.class_title_en = l.title_en[len(common_title):]
              elif len(l.class_no) > 0:
                l.class_title_en = l.class_no
              else:
                l.class_title_en = u'A'
              l.save(update_fields=["common_title_en", "class_title_en"])

        lectures = Lecture.objects.filter(course=self.course, deleted=False,
                                          year=self.year, semester=self.semester)
        _add_title_format(lectures)
        _add_title_format_en(lectures)

    def get_professors_short_str(self):
        professors = self.professors.all().order_by('professor_name')
        prof_name_list = [p.professor_name for p in professors]
        if len(prof_name_list) <= 2:
            return u", ".join(prof_name_list)
        return prof_name_list[0] + u" 외 " + str(len(prof_name_list)-1) + u"명",

    @classmethod
    def getQueryResearch(cls):
        return Q(type_en__in=['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'])

    @classmethod
    def getQueryReviewWritable(cls):
        now = datetime.datetime.now()
        not_writable_semesters = Semester.objects.filter(Q(courseAddDropPeriodEnd__gte=now) | Q(beginning__gte=now))
        query = reduce(
            operator.and_,
            (~Q(year=s.year, semester=s.semester) for s in not_writable_semesters),
            Q()
        )
        return query

    def __unicode__(self):
        re_str=u"%s(%s %s)"%(self.title, self.old_code, self.class_no)
        return re_str


class ExamTime(models.Model):
    """Lecture에 배정된 시험시간 """
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="examtimes")
    day = models.SmallIntegerField(choices=WEEKDAYS) #시험요일
    begin = models.TimeField() # hh:mm 형태의 시험시작시간 (24시간제)
    end = models.TimeField() # hh:mm 형태의 시험시작시간 (24시간 제)

    def __unicode__(self):
        return u'[%s] %s, %s-%s' % (
            self.lecture.code,
            self.get_day_display(),
            self.begin.strftime('%H:%M'),
            self.end.strftime('%H:%M')
        )

    def toJson(self, nested=False):
        day_str = [u"월요일", u"화요일", u"수요일", u"목요일", u"금요일", u"토요일", u"일요일"]
        day_str_en = [u"Monday", u"Tuesday", u"Wednesday", u"Thursday", u"Friday", u"Saturday", u"Sunday"]
        result = {
            "day": self.day,
            "str": day_str[self.day] + " " + self.begin.strftime("%H:%M") + " ~ " + self.end.strftime("%H:%M"),
            "str_en": day_str_en[self.day] + " " + self.begin.strftime("%H:%M") + " ~ " + self.end.strftime("%H:%M"),
            "begin": self.get_begin_numeric(),
            "end": self.get_end_numeric(),
        }

        return result

    def get_begin_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 시작 시간을 반환한다."""
        t = self.begin.hour * 60 + self.begin.minute
        return t

    def get_end_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 종료 시간을 반환한다."""
        t = self.end.hour * 60 + self.end.minute
        return t


class ClassTime(models.Model):
    """Lecture 에 배정된강의시간, 보통 하나의  Lecture 가 여러개의 강의시간을 가진다."""
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="classtimes", null=True)
    day = models.SmallIntegerField(choices=WEEKDAYS) #강의 요일
    begin = models.TimeField() # hh:mm 형태의 강의 시작시각 (24시간제)
    end = models.TimeField() # hh:mm 형태의 강의 끝나는 시각 (24시간 제)
    type = models.CharField(max_length =1, choices=CLASS_TYPES) #강의 or 실험
    building_id = models.CharField(max_length=10, blank=True, null=True) #건물 고유 ID
    building_full_name = models.CharField(max_length=60, blank=True, null=True) #건물 이름(ex> (E11)창의학습관)
    building_full_name_en = models.CharField(max_length=60, blank=True, null=True) #건물 이름(ex> (E11)Creative learning Bldg.)
    room_name = models.CharField(max_length=20, null=True) #강의실 호실(ex> 304, 1104, 1209-1, 터만홀)
    unit_time = models.SmallIntegerField(null=True) #수업 교시

    def toJson(self, nested=False):
        building_full_name = self.building_full_name
        building_full_name_en = self.building_full_name_en
        # No classroom info
        if building_full_name == None:
            room_name = ""
            building_code = ""
            classroom = u"정보 없음"
            classroom_en = u"Unknown"
            classroom_short = u"정보 없음"
            classroom_short_en = u"Unknown"
        # Building name has form of "(N1) xxxxx"
        elif building_full_name[0] == "(":
            building_code = building_full_name[1:building_full_name.find(")")]
            building_name = building_full_name[len(building_code)+2:]
            building_name_en = building_full_name_en[len(building_code)+2:]
            room_name = self.room_name
            if room_name == None: room_name=""
            classroom = "(" + building_code + ") " + building_name + " " + room_name
            classroom_en = "(" + building_code + ") " + building_name_en + " " + room_name
            classroom_short = "(" + building_code + ") " + room_name
            classroom_short_en = "(" + building_code + ") " + room_name
        # Building name has form of "xxxxx"
        else:
            building_code=""
            room_name = self.room_name
            if room_name == None: room_name=""
            classroom = building_full_name + " " + room_name
            classroom_en = building_full_name_en + " " + room_name
            classroom_short = building_full_name + " " + room_name
            classroom_short_en = building_full_name_en + " " + room_name

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
        t = self.begin.hour * 60 + self.begin.minute
        if t % 30 != 0:
            t = t - (t % 30)
        return t

    def get_end_numeric(self):
        """0시 0분을 기준으로 분 단위로 계산된 종료 시간을 반환한다."""
        """30분 단위로 올림한다"""
        t = self.end.hour * 60 + self.end.minute
        if t % 30 != 0:
            t = t + (30 - (t % 30))
        return t

    def get_location(self):
        if self.room_name is None:
            return u'%s' % (self.building_full_name_ko)
        try:
            int(self.room_name)
            return u'%s %s호' % (self.building_full_name_ko, self.room_name)
        except ValueError:
            return u'%s %s' % (self.building_full_name_ko, self.room_name)

    def get_location_en(self):
        if self.room_name is None:
            return u'%s' % (self.building_full_name_en)
        try:
            int(self.room_name)
            return u'%s %s' % (self.building_full_name_en, self.room_name)
        except ValueError:
            return u'%s %s' % (self.building_full_name_en, self.room_name)

    @staticmethod
    def numeric_time_to_str(numeric_time):
        return u'%s:%s' % (numeric_time // 60, numeric_time % 60)

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

    def __unicode__(self):
        return self.code

    def getCacheKey(self, nested):
        return "department:%d:%s" % (self.id, 'nested' if nested else 'normal')

    def toJson(self, nested=False):
        cache_id = self.getCacheKey(nested)
        result_cached = cache.get(cache_id)
        if result_cached != None:
            return result_cached

        result = {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'code': self.code,
        }

        cache.set(cache_id, result, 60 * 30)

        return result


class Course(models.Model):
    # Fetched from KAIST Scholar DB
    old_code = models.CharField(max_length=10, db_index=True)
    department = models.ForeignKey('Department', on_delete=models.PROTECT, db_index=True)
    professors = models.ManyToManyField('Professor', db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)

    # Updated by command update_course_summary
    summury = models.CharField(max_length=4000, default="")

    related_courses_prior = models.ManyToManyField('Course', related_name='+')
    related_courses_posterior = models.ManyToManyField('Course', related_name='+')

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    review_num = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    latest_written_datetime = models.DateTimeField(default=None, null=True)

    def getCacheKey(self, nested):
        return "course:%d:%s" % (self.id, 'nested' if nested else 'normal')

    def toJson(self, nested=False, user=None):
        def addUserspecificData(result, user):
            # Add user read info
            if (not user) or (not user.is_authenticated()):
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

            result.update({
                'userspecific_is_read': is_read,
            })

        cache_id = self.getCacheKey(nested)
        result_cached = cache.get(cache_id)
        if result_cached != None:
            if not nested:
                addUserspecificData(result_cached, user)
            return result_cached

        # Don't change this into model_to_dict: for security and performance
        result = {
                "id": self.id,
                "old_code": self.old_code,
                "department": self.department.toJson(nested=True),
                "type": self.type,
                "type_en": self.type_en,
                "title": self.title,
                "title_en": self.title_en,
                "summary": self.summury if len(self.summury)>0 else '등록되지 않았습니다.',
                "review_num": self.review_num,
        }

        if nested:
            cache.set(cache_id, result, 60 * 10)
            return result
        
        result.update({
            "related_courses_prior": [c.toJson(nested=True) for c in self.related_courses_prior.all()],
            "related_courses_posterior": [c.toJson(nested=True) for c in self.related_courses_posterior.all()],
            'professors': [p.toJson(nested=True) for p in self.professors.all().order_by('professor_name')],
            'grade': self.grade,
            'load': self.load,
            'speech': self.speech,
        })

        cache.set(cache_id, result, 60 * 10)

        addUserspecificData(result, user)

        return result

    def recalc_score(self):
        from apps.review.models import Review
        reviews = Review.objects.filter(lecture__course=self)
        self.review_num = sum((r.like+1) for r in reviews)
        self.grade_sum = sum((r.like+1)*r.grade*3 for r in reviews)
        self.load_sum = sum((r.like+1)*r.load*3 for r in reviews)
        self.speech_sum = sum((r.like+1)*r.speech*3 for r in reviews)
        self.avg_update()
        self.save()

    def avg_update(self):
        if self.review_num>0:
            self.grade = (self.grade_sum + 0.0)/self.review_num
            self.load = (self.load_sum + 0.0)/self.review_num
            self.speech = (self.speech_sum + 0.0)/self.review_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
        self.save()

    def update_related_courses(self):
        pass

    def __unicode__(self):
        return u"%s(%s)"%(self.title,self.old_code)



class Professor(models.Model):
    # Fetched from KAIST Scholar DB
    professor_name = models.CharField(max_length=100, db_index=True)
    professor_name_en = models.CharField(max_length=100, blank=True, null=True)
    professor_id = models.IntegerField()
    major = models.CharField(max_length=30)
    course_list = models.ManyToManyField('Course', db_index=True)

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    review_num = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    def toJson(self, nested=False):
        result = {
            'name': self.professor_name,
            'name_en': self.professor_name_en,
            'professor_id': self.professor_id,
            "review_num": self.review_num,
        }

        if nested:
            return result

        # Add course information
        result.update({
            'courses': [c.toJson(nested=True) for c in self.course_list.all()],
            'grade': self.grade,
            'load': self.load,
            'speech': self.speech,
        })

        return result

    def recalc_score(self):
        from apps.review.models import Review
        reviews = Review.objects.filter(lecture__professors=self)
        self.review_num = sum((r.like+1) for r in reviews)
        self.grade_sum = sum((r.like+1)*r.grade*3 for r in reviews)
        self.load_sum = sum((r.like+1)*r.load*3 for r in reviews)
        self.speech_sum = sum((r.like+1)*r.speech*3 for r in reviews)
        self.avg_update()
        self.save()

    def avg_update(self):
        if self.review_num>0:
            self.grade = (self.grade_sum + 0.0)/self.review_num
            self.load = (self.load_sum + 0.0)/self.review_num
            self.speech = (self.speech_sum + 0.0)/self.review_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
        self.save()

    def __unicode__(self):
        return u"%s(id:%d)"%(self.professor_name,self.professor_id)


class CourseUser(models.Model):
    course = models.ForeignKey('Course', related_name='read_users_courseuser', on_delete=models.CASCADE)
    user_profile = models.ForeignKey('session.UserProfile', on_delete=models.CASCADE)
    latest_read_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['course', 'user_profile']]
