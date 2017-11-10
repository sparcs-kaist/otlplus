# -*- coding: utf-8
#import Sybase
import pyodbc
import sys, getpass, re
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
#from otl.apps.accounts.models import UserProfile
#from otl.apps.timetable.models import Lecture
from apps.subject.models import Department
from apps.session.models import UserProfile
from optparse import make_option
from datetime import datetime, timedelta, time, date
from django.utils import timezone

class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--host', dest='host', help=u'Specifies server address.'),
        make_option('--port', dest='port', help=u'Specifies server port.'),
        make_option('--user', dest='user', help=u'Specifies user name to log in.'),
        make_option('--year', dest='year', help=u''),
        make_option('--semester', dest='semester', help=u''),
        make_option('--password', dest='password', help=u'Specifies passowrd to log in.'),
        make_option('--encoding', dest='encoding', help=u'Sepcifies character encoding to decode strings from database. (default is cp949)', default='cp949'),
    )
    help = u'Imports KAIST scholar database.'
    args = u'--host=143.248.X.Y:PORT --user=USERNAME'

    def handle(self, *args, **options):
        host = options.get('host', None)
        port = options.get('port', None)
        user = options.get('user', None)
        year = datetime.now().year
        semester = ((datetime.now().month+9)%12)/3+1
        password = options.get('password', None)
        encoding = options.get('encoding', 'cp949')
        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print
            return

        try:
            #db = Sybase.connect(host, user, password, 'scholar')
            db = pyodbc.connect('DRIVER=FreeTDS;TDS_Version=4.2;SERVER=%s;PORT=%s;DATABASE=%s;UID=%s;PWD=%s;CHARSET=%s'
                                % (host, port, 'scholar', user, password, 'UTF8'))
        except pyodbc.DatabaseError:
            print>>sys.stderr, 'Connection failed. Check username and password.'
            return

        c = db.cursor()
        print year, semester
 
        c.execute('SELECT * FROM view_report_e_degree_k')
        user_dept = c.fetchall()

        c.execute('SELECT * FROM view_kds_students_other_major')
        user_major_minor = c.fetchall()

        c.close()
        db.close()

        for a in user_dept:
            user = UserProfile.objects.filter(student_id=a[0])
            try:
                dept = Department.objects.get(id=a[1])
            except ObjectDoesNotExist:
                if len(user)>0:
                    print("No department with id %d\n%s" % (a[1], a))
                continue

            for u in user:
                u.department = dept
                u.save()
        
        for a in user_major_minor:
            user = UserProfile.objects.filter(student_id=a[0])
            dept = Department.objects.filter(name=a[2].decode("cp949"))

            for u in user:
                for d in dept:
                    if a[1].decode('cp949') == u"부전공신청":
                        u.minors.add(d)
                    elif a[1].decode('cp949') == u"복수전공신청":
                        u.majors.add(d)
                    else:
                        print("Major/minor type not matching : " % (a.decode('cp959')))

