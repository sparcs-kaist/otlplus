# -*- codingd: utf-8
from django.db import models
from apps.subject.models import *

class TimeTable(models.Model):
	lecture = ForeignKey(Lecture)
	year = IntegerField(null=True) # 몇넌도의 타임테이블인지
	semester = SmallIntegerField(null=True) # 어떤학기의 타임테이블인지
	table_id = SmallIntegerField(null=True) # 몇번째 타임테이블인지 0,1,2,3



# Create your models here.


