#-*- coding: utf-8 -*-
from django.db import models
from apps.enum.common import * #for enum type (for choices)
from datetime import date, time


class Lecture(models.Model):
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
    num_people = models.IntegerField(default=0, blank=True, null=True)
    professor = models.ManyToManyField('Professor', related_name='lecture_professor', blank=True)
    is_english = models.BooleanField()
    deleted = models.BooleanField(default=False)

    course = models.ForeignKey('Course', related_name='lecture_course')

    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)

    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    comment_num = models.IntegerField(default=0)

    syllabus = models.CharField(max_length=260, blank=True, null=True) #실라부스 url저장
    # TODO syllabus url 만드는 method만들기.

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
    """스크립트 짤 때 주의해야 할 부분은 호실 필드이다!!!!"""
    lecture = models.ForeignKey(Lecture, related_name="classtime_set", null=True)
    day = models.SmallIntegerField(choices=WEEKDAYS) #강의 요일
    begin = models.TimeField() # hh:mm 형태의 강의 시작시각 (24시간제)
    end = models.TimeField() # hh:mm 형태의 강의 끝나는 시각 (24시간 제)
    type = models.CharField(max_length =1, choices=CLASS_TYPES) #강의 or 실험
    building = models.CharField(max_length=10, blank=True, null=True) #건물 고유 ID
    roomName_ko = models.CharField(max_length=60, blank=True, null=True) #강의실 이름(한글, ex> 터만홀)
    roomName_en = models.CharField(max_length=60, blank=True, null=True) #강의실 이름(영문, ex> TermanHall)
    roomNum = models.CharField(max_length=10, null=True) #강의실 호실(ex> 304, 1104, 1209-1)
    unit_time = models.SmallIntegerField(null=True) #수업 교시

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


class Course(models.Model):
    old_code = models.CharField(max_length=10, db_index=True)
    code_num = models.CharField(max_length=10, db_index=True, default='D')
    department = models.ForeignKey('Department', db_index=True)
    professors = models.ManyToManyField('Professor', db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)
    summury = models.CharField(max_length=4000, default="")

    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)
    comment_num = models.IntegerField(default=0)

    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

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

    def __unicode__(self):
        return u"%s(%s)"%(self.title,self.old_code)


class Professor(models.Model):
    professor_name = models.CharField(max_length=100, db_index=True)
    professor_name_en = models.CharField(max_length=100, blank=True, null=True)
    professor_id = models.IntegerField()
    major = models.CharField(max_length=30)
    course_list = models.ManyToManyField('Course', db_index=True)

    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.FloatField(default=0.0)
    comment_num = models.IntegerField(default=0)

    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

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

    def __unicode__(self):
        return u"%s(id:%d)"%(self.professor_name,self.professor_id)


class CourseFiltered(models.Model):
    title = models.CharField(max_length=100, default="", db_index=True, unique=True)
    courses = models.ManyToManyField('Course', db_index=True)

    def __unicode__(self):
        return self.title
