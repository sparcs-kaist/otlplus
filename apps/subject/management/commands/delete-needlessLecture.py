# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Lecture, Course
from django.db.models import Q
class Command(BaseCommand):
    help = 'delete unnecessary lecture'
    def handle(self, *args, **options):
        print "delete unnecessary lecture start!"
        count = 0
        for aLecture in list(Lecture.objects.filter(credit=0, num_classes=0, num_labs=0, credit_au=0)):
            count+=1
            aLecture.delete()

        for aLecture in list(Lecture.objects.filter(Q(title__startswith=u"개별연구")| Q(title__startswith=u"졸업연구") | Q(title__startswith=u"논문연구"))):
            count+=1
            aLecture.delete()

        for aLecture in list(Lecture.objects.filter(Q(type__startswith=u"개별연구")| Q(type__startswith=u"졸업연구") | Q(type__startswith=u"논문연구"))):
            count+=1
            aLecture.delete()

        for aLecture in list(Lecture.objects.filter(Q(type__startswith=u"연구필수"))):
            count+=1
            aLecture.delete()

        for aCourse in Course.objects.all():
            if not aCourse.lecture_course.all().exists():
                aCourse.delete()
        print "total %d Lectures deleted!"%count
