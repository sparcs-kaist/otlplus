# -*- coding: utf-8
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
from apps.subject.models import Department, Professor, Lecture, Course
#from otl.apps.timetable.models import ClassTime, ExamTime, Syllabus
from optparse import make_option
import sys, getpass, re
#import Sybase
from apps.subject.models import *
import urllib2
import urllib

class Command(BaseCommand):
    help = u'Delete and Merge duplicate professors - professors with same name, department, and email address'

    def handle(self, *args, **options):
        '''
        professors = Professor.objects.all()
        professors_names = map(lambda x: x.professor_name, list(professors))
        professors_duplicate = map(lambda x: professors.count(x) > 1, professors)
        '''
        print self.get_email(u'\uae40\uad11\ub144')

    def get_lecture_class(self, class_no):
        class_no = class_no.encode('utf-8')
        if class_no == '':
            return '%20%20'
        else:
            return class_no + '%20'

    def get_email(self, prof_name):
        lecture = Lecture.objects.filter(professor=Professor.objects.all().filter(professor_name=prof_name.encode('utf-8'))[0])[0]
        year = str(lecture.year)
        term = str(lecture.semester)
        subject_no = lecture.code.encode('utf-8') 
        lecture_class = self.get_lecture_class(lecture.class_no)
        dept_id = str(lecture.department.id)

        #param = urllib.urlencode({'year': str(lecture.year), 'term': str(lecture.semester), 'subject_no': lecture.code.encode('utf-8'), 'lecture_class': self.get_lecture_class(lecture.class_no), 'dept_id': str(lecture.department.id)})
        req = urllib2.Request("https://ssogw6.kaist.ac.kr/syllabusInfo?year="+year+"&term="+term+"&subject_no="+subject_no+"&lecture_class="+lecture_class+"&dept_id="+dept_id, headers={ 'User-Agent': 'Mozilla/5.0' })
        #req = urllib2.Request("https://ssogw6.kaist.ac.kr/syllabusInfo?"+param, headers={ 'User-Agent': 'Mozilla/5.0' })
        html = urllib2.urlopen(req).read()
        email = html.split("<th>E-Mail</th>")[1].split("</td>")[0].split("<td>")[1]
        return email
'''
    def merge_and_delete(Professor professor1, Professor professor2):
        p1.course_list =
'''
