#-*- coding: utf-8 -*-
import re, sys
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
from apps.subject.models import Course

class Command(BaseCommand):
    def handle(self, *args, **options):

        f = open("/var/www/GC2014.txt","r")
        a = f.readlines()
        p = re.compile('^[a-zA-Z]{2,}[0-9]{3}\s')
        for i in range(len(a)):
            print(i)
            if(p.match(a[i])):
                course_code = p.match(a[i]).group()[:-1]
                i+=1
                course_summury = ""
                while(len(a[i])>2 and a[i][0]!=" " and a[i][0]!="|"):
                    course_summury += a[i].strip()
                    i+=1
                try:
                    course = Course.objects.get(old_code = course_code)
                    course.summury = course_summury
                    course.save()
                    print(course.summury)
                except:
                    pass
        f.close()
