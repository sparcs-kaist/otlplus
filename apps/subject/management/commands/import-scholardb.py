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

class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--host', dest='host', help=u'Specifies server address.'),
        make_option('--port', dest='port', help=u'Specifies server port.'),
        make_option('--user', dest='user', help=u'Specifies user name to log in.'),
        make_option('--password', dest='password', help=u'Specifies passowrd to log in.'),
        make_option('--encoding', dest='encoding', help=u'Sepcifies character encoding to decode strings from database. (default is cp949)', default='cp949'),
        make_option('--exclude-lecture', action='store_true', dest='exclude_lecture', help=u'Don\'t update lecture information when you want to update time information only.', default=False),
    )
    help = u'Imports KAIST scholar database.'
    args = u'--host=143.248.X.Y:PORT --user=USERNAME'

    def handle(self, *args, **options):
        next_year = 2016
        next_semester = 1

        rx_dept_code = re.compile(ur'([a-zA-Z]+)(\d+)')
        host = options.get('host', None)
        port = options.get('port', None)
        user = options.get('user', None)
        password = options.get('password', None)
        encoding = options.get('encoding', 'cp949')
        exclude_lecture = options.get('exclude_lecture', False)
        lecture_count = 0
        
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

        if not exclude_lecture:
            c.execute('SELECT * FROM view_OTL_charge WHERE lecture_year = %d AND lecture_term = %d' % (next_year, next_semester))
            professors = c.fetchall()

            c.execute('SELECT * FROM view_OTL_lecture WHERE lecture_year = %d AND lecture_term = %d ORDER BY dept_id' % (next_year, next_semester))
            rows = c.fetchall()
            departments = {}
            lectures_not_updated = set()

            for lecture in Lecture.objects.filter(year = next_year, semester = next_semester):
                lectures_not_updated.add(lecture.id)
            # Make Staff Professor with ID 830
            try:
                staff_professor = Professor.objects.get(professor_id=830)
            except Professor.DoesNotExist:
                staff_professor = Professor.objects.create(professor_id=830)
                staff_professor.professor_name = 'Staff'
                staff_professor.professor_name_en = 'Staff'
                staff_professor.save()

            prev_department = None
            for row in rows:
                myrow = []
                for elem in row:
                    if isinstance(elem, str):
                        try:
                            elem = elem.decode(encoding)
                        except UnicodeDecodeError:
                            eleme = u'%s (???)' % row[20]
                            print>>sys.stderr, 'ERROR: parsing error on lecture %s' % row[20]
                            print>>sys.stderr, '       cannot read "%s" in cp949.' % elem
                    myrow.append(elem)

                # Extract department info.
                lecture_no = myrow[2]
                lecture_code = myrow[20]
                lecture_class_no = myrow[3].strip()
                department_no = lecture_no[0:2]
                department_id = int(myrow[4])
                department_code = rx_dept_code.match(lecture_code).group(1)

                # Update department info.
                if prev_department != department_id:
                    new_flag = False
                    try:
                        department = Department.objects.get(id = department_id)
                        print 'Updating department: %s' % department
                    except Department.DoesNotExist:
                        department = Department(id = department_id)
                        new_flag = True
                        print 'Adding department: %s(%d)...' % (department_code, department_id)
                    department.num_id = department_no
                    department.code = department_code
                    department.name = myrow[5]
                    department.name_en = myrow[6]
                    department.save()

                    if new_flag:
                        departments = Department.objects.filter(code = department_code, visible=True)
                        for dept in departments:
                            if dept.id != department.id:
                                dept.visible = False
                                dept.save()

                prev_department = department_id

                # Extract lecture info.
                #try:
                    #print 'Retreiving %s: %s [%s]...' % (lecture_code, myrow[7].encode('utf-8'), lecture_class_no)
                #except UnicodeDecodeError:
                    #print 'Retreiving %s: ??? [%s]...' % (lecture_code, lecture_class_no)
                    #myrow[7] = u'???'
                lecture_key = {
                    'code': lecture_no,
                    'year': int(myrow[0]),
                    'semester': int(myrow[1]),
                    'deleted': False,
                    'class_no': lecture_class_no,
                }
                # Convert the key to a hashable object
                lecture_key_hashable = -1
                try:
                    lecture = Lecture.objects.get(**lecture_key)
                    lecture_key_hashable = lecture.id
                    print 'Updating existing lecture...'
                except Lecture.DoesNotExist:
                    lecture = Lecture(**lecture_key)
                    lecture.num_people = 0
                    print 'Creating new lecture...'

                # Update lecture info.
                lecture.department = department
                lecture.old_code = myrow[20]
                lecture.title = myrow[7]
                lecture.title_en = myrow[8]
                lecture.type = myrow[10]        # 과목구분 (한글)
                lecture.type_en = myrow[11]     # 과목구분 (영문)
                lecture.audience = int(myrow[12])   # 학년 구분
                lecture.limit= myrow[17]            # 인원제한
                lecture.credit = myrow[16]          # 학점
                lecture.credit_au = myrow[13]       # AU
                lecture.num_classes = int(myrow[14])    # 강의시수
                lecture.num_labs = int(myrow[15])       # 실험시수
                '''
                if myrow[19] != None and len(myrow[19]) >= 190:
                    myrow[19] = myrow[19][:190]
                lecture.notice = myrow[19]          # 비고
                '''
                lecture.is_english = True if myrow[21] == 'Y' else False # 영어강의 여부
                lecture.deleted = False
                # Course save
                try:
                    course = Course.objects.get(old_code=lecture.old_code)
                    course.department = department
                    course.type = lecture.type
                    course.type_en = lecture.type_en
                    course.title = lecture.title.split("<")[0].split("[")[0]
                    course.title_en = lecture.title_en.split("<")[0].split("[")[0]
                    course.save()
#                    print "Updating Course ... %s" % course.title
                except Course.DoesNotExist:
                    course = Course()
                    course.old_code = lecture.old_code
                    course.department = department
                    course.type = lecture.type
                    course.type_en = lecture.type_en
                    course.title = lecture.title.split("<")[0].split("[")[0]
                    course.title_en = lecture.title_en.split("<")[0].split("[")[0]

                    course.grade_average = 0.0
                    course.load_average= 0.0
                    course.speech_average = 0.0
                    course.total_average = 0.0
                    ################################### course total score
                    '''
                    course.score_average = 0
                    course.load_average = 0
                    course.gain_average = 0
                    '''
                    course.save()
#                    print "Making new Course ... %s" % course.title
                lecture.course = course
                lecture.save()
                lecture_count += 1
                # professor save
                match_scholar = filter(lambda a: lecture.year == a[0] and lecture.semester == a[1] and lecture.code == a[2] and lecture.class_no.strip() == a[3].strip() and lecture.department_id == a[4], professors)
                if len(match_scholar) != 0:
                    professors_not_updated = set()
                    for prof in lecture.professor.all():
                        professors_not_updated.add(prof.id)
                    for i in match_scholar:
                        try:
                            prof_id = i[5]
                            prof_name = unicode(i[6], 'cp949')
                            if i[8] is None or i[8]=='':
                                prof_name_en = ''
                            else:
                                prof_name_en = unicode(i[8].strip(),'cp949')
                            if i[4] is None or i[4]=='':
                                prof_major = ''
                            else:
                                prof_major = i[4]
                            professor = Professor.objects.get(professor_id=prof_id)
                            if professor.professor_name != prof_name and prof_id !=830:
                                professor.professor_name = prof_name
                                professor.save()
                            if professor.professor_name_en != prof_name_en and prof_id != 830 and prof_name_en!='':
                                professor.professor_name_en = prof_name_en
                                professor.save()
                            if professor.major != prof_major and prof_id != 830:
                                professor.major = prof_major
                                professor.save()
                            professors_not_updated.remove(professor.id)
                        except Professor.DoesNotExist:
                            professor = Professor.objects.create(professor_id=prof_id)
                            professor.professor_name = prof_name
                            professor.professor_name_en = prof_name_en
                            professor.major = prof_major
                            professor.save()
#                            print "Making new Professor ... %s" % professor.professor_name
                        except KeyError:
                            pass
                        lecture.professor.add(professor)
                        if professor.professor_id != 830:
                            lecture.course.professors.add(professor)

                    for key in professors_not_updated:
                        professor = Professor.objects.get(id=key)
                        lecture.professor.remove(professor)
                else:
                    lecture.professor.add(staff_professor)

                try:
                    lectures_not_updated.remove(lecture_key_hashable)
                except KeyError:
                    pass

            c.close()

        # Extract exam-time, class-time info.
        '''
        print 'Extracting exam time information...'
        c = db.cursor()
        c.execute('SELECT * FROM view_OTL_exam_time WHERE lecture_year = %d AND lecture_term = %d' % (next_year, next_semester))
        exam_times = c.fetchall()
        c.close()
        ExamTime.objects.filter(lecture__year__exact=next_year, lecture__semester=next_semester).delete()
        for row in exam_times:
            myrow = []
            for elem in row:
                if isinstance(elem, str):
                    elem = elem.decode(encoding)
                myrow.append(elem)
            lecture_key = {
                'code': myrow[2],
                'year': int(myrow[0]),
                'semester': int(myrow[1]),
                'department': Department.objects.filter(id = int(myrow[4]))[0],
                'class_no': myrow[3].strip(),
            }
            try:
                lecture = Lecture.objects.get(**lecture_key)
                exam_time = ExamTime(lecture=lecture)
                exam_time.day = int(myrow[5]) - 1
                exam_time.begin = time(hour=myrow[6].hour, minute=myrow[6].minute)
                exam_time.end = time(hour=myrow[7].hour, minute=myrow[7].minute)
                print 'Updating exam time for %s' % lecture
                exam_time.save()
            except Lecture.DoesNotExist:
                print 'Exam-time for non-existing lecture %s; skip it...' % myrow[2]


        '''
        # Extract class-time.
        '''
        print 'Extracting class time information...'
        c = db.cursor()
        c.execute('SELECT * FROM view_OTL_time WHERE lecture_year = %d AND lecture_term = %d' % (next_year, next_semester))
        class_times = c.fetchall()
        c.close()
        ClassTime.objects.filter(lecture__year__exact=next_year, lecture__semester=next_semester).delete()
        for row in class_times:
            myrow = []
            for elem in row:
                if isinstance(elem, str):
                    elem = elem.decode(encoding)
                myrow.append(elem)
            lecture_key = {
                'code': myrow[2],
                'year': int(myrow[0]),
                'semester': int(myrow[1]),
                'department': Department.objects.filter(id = int(myrow[4]))[0],
                'class_no': myrow[3].strip(),
            }
            try:
                lecture = Lecture.objects.get(**lecture_key)
                class_time = ClassTime(lecture=lecture)
                class_time.day = int(myrow[5]) - 1
                class_time.begin = time(hour=myrow[6].hour, minute=myrow[6].minute)
                class_time.end = time(hour=myrow[7].hour, minute=myrow[7].minute)
                class_time.type = myrow[8]
                class_time.building = myrow[9]
                class_time.room = myrow[10]
                class_time.room_ko = myrow[12]
                class_time.room_en = myrow[13]
                try:
                    class_time.unit_time = int(myrow[11])
                except (ValueError, TypeError):
                    class_time.unit_time = 0
                print 'Updating class time for %s' % lecture
                class_time.save()
            except Lecture.DoesNotExist:
                print 'Class-time for non-existing lecture %s; skip it...' % myrow[2]
        '''
        # Extract Syllabus info.
        '''
        c = db.cursor()
        c.execute('SELECT * FROM view_OTL_syllabus WHERE lecture_year = %d AND lecture_term = %d' % (next_year, next_semester))
        syllabuses = c.fetchall()
        c.close()
        Syllabus.objects.filter(lecture__year__exact=next_year, lecture__semester=next_semester).delete()

        for row in syllabuses:
            myrow = []
            for elem in row:
                if isinstance(elem, str):
                    try:
                        elem = elem.decode(encoding)
                    except UnicodeDecodeError:
                        eleme = u'%s (???)' % row[2]
                        print>>sys.stderr, 'ERROR: parsing error on lecture %s' % row[2]
                        print>>sys.stderr, '       cannot read "%s" in cp949.' % elem
                myrow.append(elem)
            lecture_key = {
                'code': myrow[2],
                'year': int(myrow[0]),
                'semester': int(myrow[1]),
                'department': Department.objects.filter(id = int(myrow[4]))[0],
                'class_no': myrow[3].strip(),
            }
            try:
                lecture = Lecture.objects.get(**lecture_key)
                syllabus = Syllabus(lecture=lecture)
                syllabus.professor_info = myrow[5]
                syllabus.abstract = myrow[6]
                syllabus.evluation = myrow[7]
                syllabus.materials = myrow[8]
                syllabus.plan = myrow[9]
                syllabus.etc = myrow[10]
                syllabus.url = myrow[11]
                syllabus.attachment = myrow[12]

                print 'Updating syllabus information for %s' % lecture
                syllabus.save()
            except Lecture.DoesNotExist:
                print 'Syllabus information for non-existing lecture %s; skip it...' % myrow[2]
        '''
        if not exclude_lecture:
            # Mark deleted lectures to notify users.
            print 'Marking deleted lectures...'
            for key in lectures_not_updated:
                lecture = Lecture.objects.get(id = key)
                lecture.deleted = True
#                print '%s is marked as deleted...' % lecture
                lecture.save()

        db.close()

        print '\nTotal number of departments : %d' % Department.objects.count()
        print 'Total number of lectures newly added : %d' % lecture_count
