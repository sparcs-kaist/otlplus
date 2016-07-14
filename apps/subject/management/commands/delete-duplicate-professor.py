# -*- coding: utf-8
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
from apps.subject.models import Department, Professor, Lecture, Course
#from otl.apps.timetable.models import ClassTime, ExamTime, Syllabus
from optparse import make_option
from datetime import time
import sys, getpass, re
#import Sybase
import pyodbc
import datetime
from apps.subject.models import *
import urllib2

class Command(BaseCommand):
    help = u'Delete and Merge duplicate professors - professors with same name, department, and email address'

    def handle(self, *args, **options):
        '''
        professors = Professor.objects.all()
        professors_names = map(lambda x: x.professor_name, list(professors))
        professors_duplicate = map(lambda x: professors.count(x) > 1, professors)
        '''
        print self.get_email("2016", "3", "36.341", "%20%20", "4421")

    def get_email(self, year, term, subject_no, lecture_class, dept_id):
        req = urllib2.Request("https://ssogw6.kaist.ac.kr/syllabusInfo?year="+year+"&term="+term+"&subject_no="+subject_no+"&lecture_class="+lecture_class+"&dept_id="+dept_id, headers={ 'User-Agent': 'Mozilla/5.0' })
        html = urllib2.urlopen(req).read()
        email = html.split("<th>E-Mail</th>")[1].split("</td>")[0].split("<td>")[1]
        return email
'''
    def merge_and_delete(Professor professor1, Professor professor2):
        p1.course_list =
'''
