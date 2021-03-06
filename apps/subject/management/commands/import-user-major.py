# -*- coding: utf-8
#import Sybase
from scholardb_access import execute
import sys, getpass, re
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
#from otl.apps.accounts.models import UserProfile
#from otl.apps.timetable.models import Lecture
from apps.subject.models import Department
from apps.session.models import UserProfile
from datetime import datetime, timedelta, time, date
from django.utils import timezone


class Command(BaseCommand):
    def add_arguments(self,parser):
        parser.add_argument('--host', dest='host', help=u'Specifies server address.')
        parser.add_argument('--port', dest='port', help=u'Specifies server port.')
        parser.add_argument('--user', dest='user', help=u'Specifies user name to log in.')
        parser.add_argument('--password', dest='password', help=u'Specifies passowrd to log in.')
        parser.add_argument('--encoding', dest='encoding', help=u'Sepcifies character encoding to decode strings from database. (default is cp949)', default='cp949')
        parser.add_argument('--studentid', dest='studentid', help=u'Specifies student id to load major')

    help = u'Imports KAIST scholar database.'
    args = u'--host=143.248.X.Y:PORT --user=USERNAME'

    def handle(self, *args, **options):
        host = options.get('host', None)
        port = options.get('port', None)
        user = options.get('user', None)
        password = options.get('password', None)
        encoding = options.get('encoding', 'cp949')
        studentid = options.get('studentid', None)
        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print
            return

        if studentid is None:
            query = 'SELECT * FROM view_report_e_degree_k'
        else:
            query = 'SELECT * FROM view_report_e_degree_k WHERE student_no=%d' % int(studentid)
        user_dept = execute(host, port, user, password, query)

        if studentid is None:
            query = 'SELECT * FROM view_kds_students_other_major'
        else:
            query = 'SELECT * FROM view_kds_students_other_major WHERE student_no=%d' % int(studentid)
        user_major_minor = execute(host, port, user, password, query)

        for a in user_dept:
            userprofiles = UserProfile.objects.filter(student_id=a[0])
            try:
                department = Department.objects.get(id=a[1])
            except ObjectDoesNotExist:
                if len(userprofiles)>0:
                    print("No department with id %d\n%s" % (a[1], a))
                continue

            for u in userprofiles:
                u.department = department
                u.save()
        
        for a in user_major_minor:
            userprofiles = UserProfile.objects.filter(student_id=a[0])
            departments = Department.objects.filter(name=a[2].decode("cp949"))

            for u in userprofiles:
                for d in departments:
                    if a[1].decode('cp949') == u"부전공신청":
                        u.minors.add(d)
                    elif a[1].decode('cp949') == u"복수전공신청":
                        u.majors.add(d)
                    else:
                        print("Major/minor type not matching : " % (a.decode('cp959')))

