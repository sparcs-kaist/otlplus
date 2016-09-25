# -*- coding: utf-8
from django.db import models
from apps.subject.models import *
from apps.session.models import *


class TimeTable(models.Model):
    lecture = models.ManyToManyField(Lecture)
    user = models.ForeignKey(UserProfile, related_name="timetable_set") # 'UserProfile' 이부분이 좀 불안함 by ashe.
    year = models.IntegerField(null=True) # 몇넌도의 타임테이블인지
    semester = models.SmallIntegerField(null=True) # 어떤학기의 타임테이블인지
    table_id = models.SmallIntegerField(null=True) # 몇번째 타임테이블인지 0,1,2,3



# Create your models here.


