# -*- coding: utf-8
#import Sybase
import pyodbc
import sys, getpass, re
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.exceptions import *
#from otl.apps.accounts.models import UserProfile
#from otl.apps.timetable.models import Lecture
from apps.subject.models import Lecture
from apps.session.models import UserProfile
from optparse import make_option

class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--host', dest='host', help=u'Specifies server address.'),
        make_option('--port', dest='port', help=u'Specifies server port.'),
        make_option('--user', dest='user', help=u'Specifies user name to log in.'),
        make_option('--password', dest='password', help=u'Specifies passowrd to log in.'),
        make_option('--encoding', dest='encoding', help=u'Sepcifies character encoding to decode strings from database. (default is cp949)', default='cp949'),
    )
    help = u'Imports KAIST scholar database.'
    args = u'--host=143.248.X.Y:PORT --user=USERNAME'

    def handle(self, *args, **options):
        host = options.get('host', None)
        port = options.get('port', None)
        user = options.get('user', None)
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
        year = 2015
        semester = 3 
        c.execute('SELECT * FROM view_OTL_attend WHERE lecture_year = %d AND lecture_term = %d' % (year, semester))
        rows = c.fetchall()

        c.close()
        db.close()
        lectures = Lecture.objects.filter(year = year, semester = semester,deleted=False)
        for a in rows:
            users = UserProfile.objects.filter(student_id = a[5])
            for user in users:
                lecture = lectures.filter(code = a[2], class_no = a[3].strip())
                if len(lecture) == 1:
                    user.take_lecture_list.add(lecture[0])
                else:
                    print>>sys.stderr, str(a[0]) + " " + str(a[1]) + " " + a[2] + " " + a[3] + "는 왜 개수가 " + str(len(lecture)) + " 지?"

