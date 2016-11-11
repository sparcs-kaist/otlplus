# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Lecture, Course
from django.db.models import Q
from apps.timetable.models import ResearchLecture
import sys

countRL = 0
def save_to_RLecture(aLecture):
	global countRL
	countRL += 1
	print str(aLecture.code) + " " + str(aLecture.department)
	newRL = ResearchLecture(
			code = aLecture.code,
			old_code = aLecture.old_code,
			year = aLecture.year,
			semester = aLecture.semester,
			department = aLecture.department,
			class_no = aLecture.class_no,
			title = aLecture.title,
			title_en = aLecture.title_en,
			type = aLecture.type,
			audience = aLecture.audience,
			credit = aLecture.credit,
			num_classes = aLecture.num_classes,
			num_labs = aLecture.num_labs,
			credit_au = aLecture.credit_au,
			limit = aLecture.limit,
			num_people = aLecture.num_people,
			#professor = aLecture.professor,
			is_english = aLecture.is_english,
			deleted = aLecture.deleted,
			course = aLecture.course)
	newRL.save()
	return

class Command(BaseCommand):
	help = 'delete unnecessary lecture'
	def handle(self, *args, **options):
		sys.setrecursionlimit(30000)
		print "delete unnecessary lecture start!"
		count = 0
		for aLecture in list(Lecture.objects.filter(credit=0, num_classes=0, num_labs=0, credit_au=0)):
			count+=1
			aLecture.delete()

		for aLecture in list(Lecture.objects.filter(Q(title__startswith=u"개별연구")| Q(title__startswith=u"졸업연구") | Q(title__startswith=u"논문연구"))):
			count+=1
			save_to_RLecture(aLecture)
			aLecture.delete()

		for aLecture in list(Lecture.objects.filter(Q(type__startswith=u"개별연구")| Q(type__startswith=u"졸업연구") | Q(type__startswith=u"논문연구"))):
			count+=1
			save_to_RLecture(aLecture)
			aLecture.delete()

		for aLecture in list(Lecture.objects.filter(Q(type__startswith=u"연구필수"))):
			count+=1
			save_to_RLecture(aLecture)
			aLecture.delete()

		for aCourse in Course.objects.all():
			if not aCourse.lecture_course.all().exists():
				aCourse.delete()
		print "total %d Lectures deleted!"%count
		print "Also, total %d Lecture(s) moved to ResearchLecture"%countRL
