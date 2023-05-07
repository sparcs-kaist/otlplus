from scholardb_access import execute
import sys
import getpass
from django.core.management.base import BaseCommand

from apps.subject.models import Lecture
from apps.session.models import UserProfile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--host", dest="host",
                            help="Specifies server address.")
        parser.add_argument("--port", dest="port",
                            help="Specifies server port.")
        parser.add_argument("--user", dest="user",
                            help="Specifies user name to log in.")
        parser.add_argument("--year", dest="year", help="")
        parser.add_argument("--student_no", dest="student_no", help="")
        parser.add_argument("--semester", dest="semester", help="")
        parser.add_argument("--password", dest="password",
                            help="Specifies passowrd to log in.")
        parser.add_argument(
            "--encoding",
            dest="encoding",
            help="Sepcifies character encoding to decode strings from database. (default is cp949)",
            default="cp949",
        )

    help = "Imports KAIST scholar database."
    args = "--host=143.248.X.Y:PORT --user=USERNAME"

    def handle(self, *args, **options):
        print("start")
        host = options.get("host", None)
        port = options.get("port", None)
        user = options.get("user", None)
        password = options.get("password", None)
        student_no = options.get("student_no", None)
        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        if not UserProfile.objects.filter(student_id=student_no).exists():
            return

        query = "SELECT * FROM view_OTL_attend WHERE student_no = %s" % student_no
        rows = execute(host, port, user, password, query)

        cleared_semester_list = []

        userprofile_list = UserProfile.objects.filter(student_id=student_no)
        lectures = Lecture.objects.filter(deleted=False)

        for userprofile in userprofile_list:
            for a in rows:
                if (a[0], a[1]) not in cleared_semester_list:
                    cleared_semester_list.append((a[0], a[1]))
                    userprofile.taken_lectures.remove(
                        *userprofile.taken_lectures.filter(year=a[0], semester=a[1]))
                try:
                    lecture = lectures.get(
                        year=a[0], semester=a[1], code=a[2], class_no=a[3].strip(), deleted=False)
                    userprofile.taken_lectures.add(lecture)
                except (Lecture.DoesNotExist, Lecture.MultipleObjectsReturned) as exception:
                    print(
                        f"error on getting lecture for {str(a[0])} {str(a[1])} {a[2]} {a[3]}", file=sys.stderr)
                    print(exception, file=sys.stderr)
