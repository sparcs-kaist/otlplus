from scholardb_access import execute
import sys
import getpass
from django.core.management.base import BaseCommand

from apps.subject.models import Semester, Lecture
from apps.session.models import UserProfile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--host", dest="host", help="Specifies server address.")
        parser.add_argument("--port", dest="port", help="Specifies server port.")
        parser.add_argument("--user", dest="user", help="Specifies user name to log in.")
        parser.add_argument("--use-default-semester",
                            action="store_true",
                            default=False,
                            dest="use_default_semester")
        parser.add_argument("--year", dest="year", help="")
        parser.add_argument("--semester", dest="semester", help="")
        parser.add_argument("--expand-semester-by", dest="expand_semester_by", type=int)
        parser.add_argument("--password", dest="password", help="Specifies passowrd to log in.")
        parser.add_argument(
            "--encoding",
            dest="encoding",
            help="Specifies character encoding to decode strings from database. (default is cp949)",
            default="cp949",
        )

    help = "Imports KAIST scholar database."
    args = "--host=143.248.X.Y:PORT --user=USERNAME"

    def handle(self, *args, **options):
        host = options.get("host", None)
        port = options.get("port", None)
        user = options.get("user", None)
        password = options.get("password", None)
        encoding = options.get("encoding")
        use_default_semester = options.get("use_default_semester")
        year = options.get("year", None)
        semester = options.get("semester", None)
        expand_semester_by = options.get("expand_semester_by", None)

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
        elif abs(expand_semester_by) > 4:
            print("Too big number for --expand-semester-by is given. -4 to 4 is allowed")
            return
        elif expand_semester_by > 0:
            offsets = range(0, expand_semester_by + 1)
        else:
            offsets = range(expand_semester_by, 1)
        target_semesters = [
            Semester.get_offsetted_semester(target_semester[0], target_semester[1], o)
            for o in offsets
        ]

        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        for s in target_semesters:
            self._import_taken_lecture(s[0], s[1], {
                "host": host,
                "port": port,
                "user": user,
                "password": password,
                "encoding": encoding,
            })


    def _import_taken_lecture(self, target_year, target_semester, db_specification):
        print(target_year, target_semester)

        host = db_specification["host"]
        port = db_specification["port"]
        user = db_specification["user"]
        password = db_specification["password"]
        encoding = db_specification["encoding"]

        query = "SELECT * FROM view_OTL_attend WHERE lecture_year = %d AND lecture_term = %d" % (target_year, target_semester)
        rows = execute(host, port, user, password, query)

        cleared_user_list = []

        lectures = Lecture.objects.filter(year=target_year, semester=target_semester, deleted=False)
        for a in rows:
            users = UserProfile.objects.filter(student_id=a[5])
            for u in users:
                if u not in cleared_user_list:
                    cleared_user_list.append(u)
                    u.taken_lectures.remove(*u.taken_lectures.filter(year=target_year, semester=target_semester))
                lecture = lectures.filter(code=a[2], class_no=a[3].strip())
                if len(lecture) == 1:
                    u.taken_lectures.add(lecture[0])
                else:
                    print(f"{str(a[0])} {str(a[1])} {a[2]} {a[3]}는 왜 개수가 {len(lecture)} 지?", file=sys.stderr)
