from scholardb_access import execute
import sys
import getpass
from django.core.management.base import BaseCommand

from utils.command_utils import get_target_semesters

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
        parser.add_argument("--expand-semester-by",
                            dest="expand_semester_by",
                            type=int,
                            choices=range(-4, 5))
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

        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        target_semesters = get_target_semesters(use_default_semester, year, semester,
                                                expand_semester_by)

        if target_semesters is None:
            return

        for y, s in target_semesters:
            self._import_taken_lecture(y, s, {
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
                try:
                    lecture = lectures.get(code=a[2], class_no=a[3].strip(), deleted=False)
                    u.taken_lectures.add(lecture)
                except (Lecture.DoesNotExist, Lecture.MultipleObjectsReturned) as exception:
                    print(f"error on getting lecture for {str(a[0])} {str(a[1])} {a[2]} {a[3]}", file=sys.stderr)
                    print(exception, file=sys.stderr)
