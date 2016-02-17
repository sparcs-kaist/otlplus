# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Course, CourseFiltered, Lecture
class Command(BaseCommand):
    help = 'update course_codenum'
    def handle(self, *args, **options):
        print "update course_codenum start!"
        
        for course in Course.objects.all():
            course.code_num = course.old_code[-3]
            course.save()
        print "update course_codenum ended!"
