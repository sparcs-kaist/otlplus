# -*- coding: utf-8
from django.core.management.base import BaseCommand
from apps.subject.models import Semester, Department, Professor, Lecture, Course, ClassTime, ExamTime

from datetime import time
import sys
import getpass
import re

from scholardb_access import execute


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--host", dest="host", help="Specifies server address.")
        parser.add_argument("--port", dest="port", help="Specifies server port.")
        parser.add_argument("--user", dest="user", help="Specifies user name to log in.")
        parser.add_argument("--password", dest="password", help="Specifies password to log in.")
        parser.add_argument(
            "--encoding",
            dest="encoding",
            help="Specifies character encoding to decode strings from database. (default is cp949)",
            default="cp949",
        )
        parser.add_argument(
            "--exclude-lecture",
            action="store_true",
            dest="exclude_lecture",
            help="Don't update lecture information when you want to update time information only.",
            default=False,
        )
        parser.add_argument("--use-default-semester",
                            action="store_true",
                            default=False,
                            dest="use_default_semester")
        parser.add_argument("--year", dest="year", type=int)
        parser.add_argument("--semester", dest="semester", type=int)
        parser.add_argument("--expand-semester-by",
                            dest="expand_semester_by",
                            type=int,
                            choices=range(-4, 5))

    help = "Imports KAIST scholar database."
    args = "--host=143.248.X.Y:PORT --user=USERNAME"

    def handle(self, *args, **options):
        host = options.get("host", None)
        port = options.get("port", None)
        user = options.get("user", None)
        password = options.get("password", None)
        encoding = options.get("encoding")
        exclude_lecture = options.get("exclude_lecture", False)
        use_default_semester = options.get("use_default_semester")
        year = options.get("year", None)
        semester = options.get("semester", None)
        expand_semester_by = options.get("expand_semester_by", None)

        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        target_semesters = self._get_target_semesters({
            "use_default_semester": use_default_semester,
            "year": year,
            "semester": semester,
            "expand_semester_by": expand_semester_by,
        })

        if target_semesters is None:
            return

        for y, s in target_semesters:
            self._import_scholardb(y, s, exclude_lecture, {
                "host": host,
                "port": port,
                "user": user,
                "password": password,
                "encoding": encoding,
            })
    
    def _get_target_semesters(self, semester_specification):
        use_default_semester = semester_specification["use_default_semester"]
        year = semester_specification["year"]
        semester = semester_specification["semester"]
        expand_semester_by = semester_specification["expand_semester_by"]

        if year is not None and semester is not None:
            target_semester = (year, semester)
        elif use_default_semester:
            default_semester = Semester.get_semester_to_default_import()
            if default_semester is not None:
                target_semester = (default_semester.year, default_semester.semester)
            else:
                print("Failed to load default semester.")
                return
        else:
            print("Target semester not specified. Use --year and --semester, or --use-default-semester")
            return

        if expand_semester_by is None:
            offsets = [0]
        elif expand_semester_by > 0:
            offsets = range(0, expand_semester_by + 1)
        else:
            offsets = range(expand_semester_by, 1)

        return [
            Semester.get_offsetted_semester(target_semester[0], target_semester[1], o)
            for o in offsets
        ]

    def _import_scholardb(self, target_year, target_semester, exclude_lecture, db_specification):
        print(f"Importing scholardb for {target_year}-{target_semester}")

        host = db_specification["host"]
        port = db_specification["port"]
        user = db_specification["user"]
        password = db_specification["password"]
        encoding = db_specification["encoding"]

        lecture_count = 0

        def _extract_department_code(lecture_old_code):
            return re.compile(r"([a-zA-Z]+)(\d+)").match(lecture_old_code).group(1)

        if not exclude_lecture:
            professor_lecture_charge_query = "SELECT * FROM view_OTL_charge WHERE lecture_year = %d AND lecture_term = %d" % (
                target_year,
                target_semester,
            )
            professor_lecture_charge_rows = execute(host, port, user, password, professor_lecture_charge_query)

            lecture_query = "SELECT * FROM view_OTL_lecture WHERE lecture_year = %d AND lecture_term = %d ORDER BY dept_id" % (
                target_year,
                target_semester,
            )
            lecture_rows = execute(host, port, user, password, lecture_query)
            departments = {}
            lectures_not_updated = set()

            for lecture in Lecture.objects.filter(year=target_year, semester=target_semester):
                lectures_not_updated.add(lecture.id)
            # Make Staff Professor with ID 830
            staff_professor, _ = Professor.objects.get_or_create(
                professor_id=Professor.STAFF_ID,
                defaults={
                    "professor_name": "Staff",
                    "professor_name_en": "Staff",
                }
            )

            prev_department = None
            for row in lecture_rows:
                myrow = row[:]

                # Extract department info.
                lecture_no = myrow[2]
                lecture_code = myrow[20]
                lecture_class_no = myrow[3].strip()
                department_no = lecture_no[0:2]
                department_id = int(myrow[4])
                department_code = _extract_department_code(lecture_code)

                # Update department info.
                if prev_department != department_id:
                    new_flag = False
                    try:
                        department = Department.objects.get(id=department_id)
                        print(f"Updating department: {department}")
                    except Department.DoesNotExist:
                        department = Department(id=department_id)
                        new_flag = True
                        print(f"Adding department: {department_code}({department_id})...")
                    department.num_id = department_no
                    department.code = department_code
                    department.name = myrow[5]
                    department.name_en = myrow[6]
                    department.save()

                    if new_flag:
                        departments = Department.objects.filter(code=department_code, visible=True)
                        for dept in departments:
                            if dept.id != department.id:
                                dept.visible = False
                                dept.save()

                prev_department = department_id

                # Extract lecture info.
                # try:
                # print 'Retrieving %s: %s [%s]...' % (lecture_code, myrow[7].encode('utf-8'), lecture_class_no)
                # except UnicodeDecodeError:
                # print 'Retrieving %s: ??? [%s]...' % (lecture_code, lecture_class_no)
                # myrow[7] = u'???'
                lecture_key = {
                    "code": lecture_no,
                    "year": int(myrow[0]),
                    "semester": int(myrow[1]),
                    "deleted": False,
                    "class_no": lecture_class_no,
                }
                # Convert the key to a hashable object
                lecture_key_hashable = -1
                try:
                    lecture = Lecture.objects.get(**lecture_key)
                    lecture_key_hashable = lecture.id
                    print(f"Updating existing lecture {lecture}")
                except Lecture.DoesNotExist:
                    lecture = Lecture(**lecture_key)
                    lecture.num_people = 0
                    print(f"Creating new lecture {lecture}")

                # Update lecture info.
                lecture.department = department
                lecture.old_code = myrow[20]
                lecture.title = myrow[7]
                lecture.title_en = myrow[8]
                lecture.type = myrow[10]  # 과목구분 (한글)
                lecture.type_en = myrow[11]  # 과목구분 (영문)
                lecture.audience = int(myrow[12])  # 학년 구분
                lecture.limit = myrow[17]  # 인원제한
                lecture.credit = myrow[16]  # 학점
                lecture.credit_au = myrow[13]  # AU
                lecture.num_classes = int(myrow[14])  # 강의시수
                lecture.num_labs = int(myrow[15])  # 실험시수
                """
                if myrow[19] != None and len(myrow[19]) >= 190:
                    myrow[19] = myrow[19][:190]
                lecture.notice = myrow[19]          # 비고
                """
                lecture.is_english = True if myrow[21] == "Y" else False  # 영어강의 여부
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
                    course.load_average = 0.0
                    course.speech_average = 0.0
                    # course total score
                    """
                    course.score_average = 0
                    course.load_average = 0
                    course.gain_average = 0
                    """
                    course.save()
                #                    print "Making new Course ... %s" % course.title
                lecture.course = course
                lecture.save()
                lecture_count += 1
                # professor save
                match_scholar = list(filter(
                    lambda p: (
                        lecture.year == p[0]
                        and lecture.semester == p[1]
                        and lecture.code == p[2]
                        and lecture.class_no.strip() == p[3].strip()
                        and lecture.department_id == p[4]
                    ),
                    professor_lecture_charge_rows,
                ))
                if len(match_scholar) != 0:
                    professors_not_updated = set()
                    for prof in lecture.professor_lecture_charge_rows.all():
                        professors_not_updated.add(prof.id)
                    for i in match_scholar:
                        try:
                            prof_id = i[5]
                            prof_name = i[6]
                            if i[8] is None or i[8] == "":
                                prof_name_en = ""
                            else:
                                prof_name_en = i[8].strip()
                            if i[4] is None or i[4] == "":
                                prof_major = ""
                            else:
                                prof_major = i[4]
                            professor = Professor.objects.get(professor_id=prof_id)
                            if professor.professor_name != prof_name and prof_id != Professor.STAFF_ID:
                                professor.professor_name = prof_name
                                professor.save()
                            if professor.professor_name_en != prof_name_en and prof_id != Professor.STAFF_ID and prof_name_en != "":
                                professor.professor_name_en = prof_name_en
                                professor.save()
                            if professor.major != prof_major and prof_id != Professor.STAFF_ID:
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
                        lecture.professor_lecture_charge_rows.add(professor)
                        if professor.professor_id != Professor.STAFF_ID:
                            lecture.course.professor_lecture_charge_rows.add(professor)

                    for key in professors_not_updated:
                        professor = Professor.objects.get(id=key)
                        lecture.professor_lecture_charge_rows.remove(professor)
                else:
                    lecture.professor_lecture_charge_rows.add(staff_professor)

                try:
                    lectures_not_updated.remove(lecture_key_hashable)
                except KeyError:
                    pass

        # Extract exam-time, class-time info.

        print("Extracting exam time information...")
        exam_time_query = "SELECT * FROM view_OTL_exam_time WHERE lecture_year = %d AND lecture_term = %d" % (
            target_year,
            target_semester,
        )
        exam_time_rows = execute(host, port, user, password, exam_time_query)
        print("exam_times")
        ExamTime.objects.filter(lecture__year__exact=target_year, lecture__semester=target_semester).delete()
        for row in exam_time_rows:
            print(row)
            myrow = row[:]
            lecture_key = {
                "deleted": False,
                "code": myrow[2],
                "year": int(myrow[0]),
                "semester": int(myrow[1]),
                "department": Department.objects.filter(id=int(myrow[4]))[0],
                "class_no": myrow[3].strip(),
            }
            try:
                lecture = Lecture.objects.get(**lecture_key)
                exam_time = ExamTime(lecture=lecture)
                exam_time.day = int(myrow[5]) - 1
                exam_time.begin = time(hour=myrow[6].hour, minute=myrow[6].minute)
                exam_time.end = time(hour=myrow[7].hour, minute=myrow[7].minute)
                print(f"Updating exam time for {lecture}")
                exam_time.save()
            except Lecture.DoesNotExist:
                print(f"Exam-time for non-existing lecture {myrow[2]}; skip it...")

        # Extract class time.

        print("Extracting class time information...")
        class_time_query = "SELECT * FROM view_OTL_time WHERE lecture_year = %d AND lecture_term = %d" % (target_year, target_semester)
        class_time_rows = execute(host, port, user, password, class_time_query)
        # print class_times
        ClassTime.objects.filter(lecture__year__exact=target_year, lecture__semester=target_semester).delete()
        for row in class_time_rows:
            print(row)
            myrow = row[:]
            lecture_key = {
                "deleted": False,
                "code": myrow[2],
                "year": int(myrow[0]),
                "semester": int(myrow[1]),
                "department": Department.objects.filter(id=int(myrow[4]))[0],
                "class_no": myrow[3].strip(),
            }
            try:
                print(myrow)
                lecture = Lecture.objects.get(**lecture_key)
                class_time = ClassTime(lecture=lecture)
                class_time.day = int(myrow[5]) - 1
                class_time.begin = time(hour=myrow[6].hour, minute=myrow[6].minute)
                class_time.end = time(hour=myrow[7].hour, minute=myrow[7].minute)
                class_time.type = myrow[8]
                class_time.building_id = myrow[9]
                class_time.room_name = myrow[10]
                class_time.building_full_name = myrow[12]
                class_time.building_full_name_en = myrow[13]
                try:
                    class_time.unit_time = int(myrow[11])
                except (ValueError, TypeError):
                    class_time.unit_time = 0
                print(f"Updating class time for {lecture}")
                class_time.save()
            except Lecture.DoesNotExist:
                print(f"Class-time for non-existing lecture {myrow[2]}; skip it...")

        # Extract Syllabus info.
        """
        syllabus_query = 'SELECT * FROM view_OTL_syllabus WHERE lecture_year = %d AND lecture_term = %d'
            % (target_year, target_semester)
        syllabus_rows = execute(host, port, user, password, syllabus_query)
        Syllabus.objects.filter(lecture__year__exact=target_year, lecture__semester=target_semester).delete()

        for row in syllabus_rows:
            myrow = row[:]
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
        """
        if not exclude_lecture:
            # Mark deleted lectures to notify users.
            print("Marking deleted lectures...")
            for key in lectures_not_updated:
                lecture = Lecture.objects.get(id=key)
                lecture.deleted = True
                #                print '%s is marked as deleted...' % lecture
                lecture.save()

        print(f"\nTotal number of departments : {Department.objects.count()}")
        print(f"Total number of lectures newly added : {lecture_count}")
