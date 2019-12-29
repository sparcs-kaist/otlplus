#-*- coding: utf-8 -*-
from django.db import models
from apps.enum.common import * #for enum type (for choices)
from datetime import date, time


class Semester(models.Model):
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    beginning = models.DateTimeField()
    end = models.DateTimeField()

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

    def toJson(self) :
        result = {
            "year": self.year,
            "semester": self.semester,
            "beginning": self.beginning,
            "end": self.end,
            "courseRegistrationPeriodStart": self.courseRegistrationPeriodStart,
            "courseRegistrationPeriodEnd": self.courseRegistrationPeriodEnd,
            "courseAddDropPeriodEnd": self.courseAddDropPeriodEnd,
            "courseDropDeadline": self.courseDropDeadline,
            "courseEvaluationDeadline": self.courseEvaluationDeadline,
            "gradePosting": self.gradePosting,
        }

        return result


class Lecture(models.Model):
    # Fetched from KAIST Scholar DB
    code = models.CharField(max_length=10, db_index=True)
    old_code = models.CharField(max_length=10, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.SmallIntegerField(db_index=True)
    department = models.ForeignKey('Department')
    class_no = models.CharField(max_length=4, blank=True)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    audience = models.IntegerField()
    credit = models.IntegerField(default=3)
    num_classes = models.IntegerField(default=3)
    num_labs = models.IntegerField(default=0)
    credit_au = models.IntegerField(default=0)
    limit = models.IntegerField(default=0)
    professor = models.ManyToManyField('Professor', related_name='lecture_professor', blank=True)
    is_english = models.BooleanField()
    deleted = models.BooleanField(default=False)

    course = models.ForeignKey('Course', related_name='lecture_course')

    # Updated by signal timetable_lecture_saved, timetable_deleted
    num_people = models.IntegerField(default=0, blank=True, null=True)

    # Updated by method update_class_title
    common_title = models.CharField(max_length=100, null=True)
    common_title_en = models.CharField(max_length=100, null=True)
    class_title = models.CharField(max_length=100, null=True)
    class_title_en = models.CharField(max_length=100, null=True)

    # Updated by view when comments are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)
    comment_num = models.IntegerField(default=0)

    def toJson(self, nested=False):
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
        }
        
        # Add formatted professor name
        prof_name_list = [p.professor_name for p in self.professor.all()]
        prof_name_list_en = [p.professor_name_en for p in self.professor.all()]
        if len(prof_name_list) <= 2:
            result.update({
                'professor_short': u", ".join(prof_name_list),
                'professor_short_en': u", ".join(prof_name_list_en),
            })
        else:
            result.update({
                'professor_short': prof_name_list[0] + u" 외 " + str(len(prof_name_list)-1) + u"명",
                'professor_short_en': prof_name_list_en[0] + u" and " + str(len(prof_name_list)-1) + u" others",
            })
        
        if nested:
            return result

        result.update({
            'professor': [p.toJson(nested=True) for p in self.professor.all()]
        })

        # Add formatted score
        if self.comment_num == 0:
            result.update({
                'has_review': False,
                'grade': 0,
                'load': 0,
                'speech': 0,
                'grade_letter': '?',
                'load_letter': '?',
                'speech_letter': '?',
            })
        else:
            letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
            result.update({
                'has_review': True,
                'grade': self.grade,
                'load': self.load,
                'speech': self.speech,
                'grade_letter': letters[int(round(self.grade))],
                'load_letter': letters[int(round(self.load))],
                'speech_letter': letters[int(round(self.speech))],
            })

        # Add classtime
        classtimes = []
        for ct in self.classtime_set.all():
            classtimes.append(ct.toJson(nested=True))
        result.update({
            'classtimes': classtimes,
        })

        # Add classroom info
        if len(classtimes) > 0:
            result.update({
                'building': classtimes[0]['building'],
                'classroom': classtimes[0]['classroom'],
                'classroom_en': classtimes[0]['classroom_en'],
                'classroom_short': classtimes[0]['classroom_short'],
                'classroom_short_en': classtimes[0]['classroom_short_en'],
                'room': classtimes[0]['room'],
            })
        else:
            result.update({
                'building': '',
                'classroom': u'정보 없음',
                'classroom_en': u'Unknown',
                'classroom_short': u'정보 없음',
                'classroom_short_en': u'Unknown',
                'room': '',
            })

        # Add examtime
        examtimes = []
        for et in self.examtime_set.all():
            examtimes.append(et.toJson(nested=True))
        result.update({
            'examtimes': examtimes,
        })

        # Add exam info
        if len(examtimes) > 1:
            result.update({
                'exam': examtimes[0]['str'] + u" 외 " + str(len(result['examtimes']-1)) + u"개",
                'exam_en': examtimes[0]['str_en'] + u" and " + str(len(result['examtimes']-1)) + u" others",
            })
        elif len(examtimes) == 1:
            result.update({
                'exam': examtimes[0]['str'],
                'exam_en': examtimes[0]['str_en'],
            })
        else:
            result.update({
                'exam': u'정보 없음',
                'exam_en': u'Unknown',
            })

        if self.type_en in ["Basic Required", "Basic Elective"]:
            result.update({
                'major_code': 'Basic',
            })
        elif self.type_en == "Humanities & Social Elective":
            result.update({
                'major_code': 'Humanity',
            })
        elif self.type_en in ["Major Required", "Major Elective", "Elective(Graduate)"]:
            result.update({
                'major_code': self.department.code,
            })
        else:
            result.update({
                'major_code': '',
            })

        return result

    def recalc_score(self):
        from apps.review.models import Comment
        self.comment_num = 0
        self.grade_sum = 0
        self.load_sum = 0
        self.speech_sum = 0
        for c in Comment.objects.filter(lecture__course=self.course,
                                        lecture__professor__in=self.professor.all()):
            if c.grade > 0:
                self.comment_num += (c.like+1)
                self.grade_sum += (c.like+1)*c.grade*3
                self.load_sum += (c.like+1)*c.load*3
                self.speech_sum += (c.like+1)*c.speech*3
        self.avg_update()
        self.save()

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0
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

    def __unicode__(self):
        professors_list=self.professor.all()
        re_str=u"%s(%s %s"%(self.title, self.old_code, professors_list[0].professor_name)
        for i in range(1,len(professors_list)):
            re_str+=", %s"%(professors_list[i].professor_name)
        re_str+=")"
        return re_str


class ExamTime(models.Model):
    """Lecture에 배정된 시험시간 """
    lecture = models.ForeignKey(Lecture, related_name="examtime_set")
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
    lecture = models.ForeignKey(Lecture, related_name="classtime_set", null=True)
    day = models.SmallIntegerField(choices=WEEKDAYS) #강의 요일
    begin = models.TimeField() # hh:mm 형태의 강의 시작시각 (24시간제)
    end = models.TimeField() # hh:mm 형태의 강의 끝나는 시각 (24시간 제)
    type = models.CharField(max_length =1, choices=CLASS_TYPES) #강의 or 실험
    building = models.CharField(max_length=10, blank=True, null=True) #건물 고유 ID
    roomName = models.CharField(max_length=60, blank=True, null=True) #건물 이름(ex> (E11)창의학습관)
    roomName_en = models.CharField(max_length=60, blank=True, null=True) #건물 이름(ex> (E11)Creative learning Bldg.)
    roomNum = models.CharField(max_length=20, null=True) #강의실 호실(ex> 304, 1104, 1209-1, 터만홀)
    unit_time = models.SmallIntegerField(null=True) #수업 교시

    def toJson(self, nested=False):
        bldg = self.roomName
        bldg_en = self.roomName_en
        # No classroom info
        if bldg == None:
            room = ""
            bldg_no = ""
            classroom = u"정보 없음"
            classroom_en = u"Unknown"
            classroom_short = u"정보 없음"
            classroom_short_en = u"Unknown"
        # Building name has form of "(N1) xxxxx"
        elif bldg[0] == "(":
            bldg_no = bldg[1:bldg.find(")")]
            bldg_name = bldg[len(bldg_no)+2:]
            bldg_name_en = bldg_en[len(bldg_no)+2:]
            room = self.roomNum
            if room == None: room=""
            classroom = "(" + bldg_no + ") " + bldg_name + " " + room
            classroom_en = "(" + bldg_no + ") " + bldg_name_en + " " + room
            classroom_short = "(" + bldg_no + ") " + room
            classroom_short_en = "(" + bldg_no + ") " + room
        # Building name has form of "xxxxx"
        else:
            bldg_no=""
            room = self.roomNum
            if room == None: room=""
            classroom = bldg + " " + room
            classroom_en = bldg_en + " " + room
            classroom_short = bldg + " " + room
            classroom_short_en = bldg_en + " " + room

        result = {
            "building": bldg_no,
            "classroom": classroom,
            "classroom_en": classroom,
            "classroom_short": classroom_short,
            "classroom_short_en": classroom_short_en,
            "room": room,
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
        if self.roomNum is None:
            return u'%s' % (self.roomName_ko)
        try:
            int(self.roomNum)
            return u'%s %s호' % (self.roomName_ko, self.roomNum)
        except ValueError:
            return u'%s %s' % (self.roomName_ko, self.roomNum)

    def get_location_en(self):
        if self.roomNum is None:
            return u'%s' % (self.roomName_en)
        try:
            int(self.roomNum)
            return u'%s %s' % (self.roomName_en, self.roomNum)
        except ValueError:
            return u'%s %s' % (self.roomName_en, self.roomNum)

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

    def toJson(self, nested=False):
        result = {
            'name': self.name,
            'name_en': self.name_en,
            'code': self.code,
        }

        return result


class Course(models.Model):
    # Fetched from KAIST Scholar DB
    old_code = models.CharField(max_length=10, db_index=True)
    department = models.ForeignKey('Department', db_index=True)
    professors = models.ManyToManyField('Professor', db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)

    # Updated by command update_course_summary
    summury = models.CharField(max_length=4000, default="")

    # Updated by command update_CourseCodeNum
    code_num = models.CharField(max_length=10, db_index=True, default='D')

    related_courses_prior = models.ManyToManyField('Course', related_name='+')
    related_courses_posterior = models.ManyToManyField('Course', related_name='+')

    # Updated by view when comments are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)
    comment_num = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    latest_written_datetime = models.DateTimeField(default=None, null=True)

    def toJson(self, nested=False, user=None):
        # Don't change this into model_to_dict: for security and performance
        result = {
                "id": self.id,
                "old_code": self.old_code,
                "department": self.department.toJson(nested=True),
                "code_num": self.code_num,
                "type": self.type,
                "type_en": self.type_en,
                "title": self.title,
                "title_en": self.title_en,
                "summary": self.summury if len(self.summury)>0 else '등록되지 않았습니다.',
                "comment_num": self.comment_num,
        }

        if nested:
            return result
        
        result.update({
            "related_courses_prior": [c.toJson(nested=True) for c in self.related_courses_prior.all()],
            "related_courses_posterior": [c.toJson(nested=True) for c in self.related_courses_posterior.all()],
        })

        # Add formatted professor name
        prof_name_list = [p.professor_name for p in self.professors.all()]
        prof_name_list_en = [p.professor_name_en for p in self.professors.all()]
        result.update({
            'professors_str': u", ".join(prof_name_list),
            'professors_str_en': u", ".join(prof_name_list_en),
            'professors': [p.toJson(nested=True) for p in self.professors.all()]
        })

        # Add formatted score
        if self.comment_num == 0:
            result.update({
                'has_review': False,
                'grade': 0,
                'load': 0,
                'speech': 0,
                'grade_letter': '?',
                'load_letter': '?',
                'speech_letter': '?',
            })
        else:
            letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
            result.update({
                'has_review': True,
                'grade': self.grade,
                'load': self.load,
                'speech': self.speech,
                'grade_letter': letters[int(round(self.grade))],
                'load_letter': letters[int(round(self.load))],
                'speech_letter': letters[int(round(self.speech))],
            })

        # Add user read info
        if (not user) or (not user.is_authenticated()):
            is_read = False
        elif not CourseUser.objects.filter(user_profile__user=user, course=self).exists():
            is_read = False
        elif self.latest_written_datetime is None:
            is_read = True
        else:
            course_user = CourseUser.objects.get(user_profile__user=user, course=self)
            is_read = self.latest_written_datetime < course_user.latest_read_datetime
        result.update({
            'userspecific_is_read': is_read,
        })

        if self.type_en in ["Basic Required", "Basic Elective"]:
            result.update({
                'major_code': 'Basic',
            })
        elif self.type_en == "Humanities & Social Elective":
            result.update({
                'major_code': 'Humanity',
            })
        elif self.type_en in ["Major Required", "Major Elective", "Elective(Graduate)"]:
            result.update({
                'major_code': self.department.code,
            })
        else:
            result.update({
                'major_code': '',
            })

        return result

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0
        self.save()

    def update_code_num(self):
        self.code_num = self.old_code[-3]
        self.save(update_fields=["code_num"])

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

    # Updated by view when comments are added/deleted/modified
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)
    comment_num = models.IntegerField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    def toJson(self, nested=False):
        result = {
            'name': self.professor_name,
            'name_en': self.professor_name_en,
            'professor_id': self.professor_id,
        }

        if nested:
            return result

        # Add course information
        result.update({
            'courses': [c.toJson(nested=True) for c in self.course_list.all()],
        })

        # Add formatted score
        if self.comment_num == 0:
            result.update({
                'has_review': False,
                'grade': 0,
                'load': 0,
                'speech': 0,
                'grade_letter': '?',
                'load_letter': '?',
                'speech_letter': '?',
            })
        else:
            letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
            result.update({
                'has_review': True,
                'grade': self.grade,
                'load': self.load,
                'speech': self.speech,
                'grade_letter': letters[int(round(self.grade))],
                'load_letter': letters[int(round(self.load))],
                'speech_letter': letters[int(round(self.speech))],
            })

        return result

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0
        self.save()

    def __unicode__(self):
        return u"%s(id:%d)"%(self.professor_name,self.professor_id)


class CourseFiltered(models.Model):
    title = models.CharField(max_length=100, default="", db_index=True, unique=True)
    courses = models.ManyToManyField('Course', db_index=True)

    def __unicode__(self):
        return self.title

class CourseUser(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    user_profile = models.ForeignKey('session.UserProfile', on_delete=models.CASCADE)
    latest_read_datetime = models.DateTimeField(auto_now=True)
