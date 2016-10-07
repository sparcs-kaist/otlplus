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

class ResearchLecture(models.Model):
	    	code = models.CharField(max_length=10,db_index=True)
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

		"""
		grade_sum = models.IntegerField(default=0)
		load_sum = models.IntegerField(default=0)
		speech_sum = models.IntegerField(default=0)
		total_sum = models.FloatField(default=0.0)

		grade = models.FloatField(default=0.0)
		load = models.FloatField(default=0.0)
		speech = models.FloatField(default=0.0)
	    total = models.FloatField(default=0.0)

	    comment_num = models.IntegerField(default=0)

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
		"""
		def __unicode__(self):
			professors_list=self.professor.all()
			re_str=u"%s(%s %s"%(self.title,self.old_code,professors_list[0].professor_name)
			for i in range(1,len(professors_list)):
				re_str+=", %s"%(professors_list[i].professor_name)
			re_str+=")"
			return re_str

# Create your models here.


