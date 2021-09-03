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
        parser.add_argument("--year", dest="year", help="")
        parser.add_argument("--semester", dest="semester", help="")
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
        # encoding = options.get("encoding", "cp949")

        if options["year"] is not None and options["semester"] is not None:
            year = int(options["year"])
            semester = int(options["semester"])
        else:
            default_semester = Semester.getImportingSemester()
            if default_semester is not None:
                year = default_semester.year
                semester = default_semester.semester
            else:
                print("Target year or semester not specified.")
                return

        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        print(year, semester)
        query = "SELECT * FROM view_OTL_attend WHERE lecture_year = %d AND lecture_term = %d" % (year, semester)
        rows = execute(host, port, user, password, query)

        cleared_user_list = []

        lectures = Lecture.objects.filter(year=year, semester=semester, deleted=False)
        for a in rows:
            users = UserProfile.objects.filter(student_id=a[5])
            for u in users:
                if u not in cleared_user_list:
                    cleared_user_list.append(u)
                    u.taken_lectures.remove(*u.taken_lectures.filter(year=year, semester=semester))
                lecture = lectures.filter(code=a[2], class_no=a[3].strip())
                if len(lecture) == 1:
                    u.taken_lectures.add(lecture[0])
                else:
                    print(f"{str(a[0])} {str(a[1])} {a[2]} {a[3]}는 왜 개수가 {len(lecture)} 지?", file=sys.stderr)
