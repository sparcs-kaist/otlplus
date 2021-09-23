from scholardb_access import execute
import getpass
from django.core.management.base import BaseCommand

from apps.subject.models import Department
from apps.session.models import UserProfile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--host", dest="host", help="Specifies server address.")
        parser.add_argument("--port", dest="port", help="Specifies server port.")
        parser.add_argument("--user", dest="user", help="Specifies user name to log in.")
        parser.add_argument("--password", dest="password", help="Specifies passowrd to log in.")
        parser.add_argument(
            "--encoding",
            dest="encoding",
            help="Specifies character encoding to decode strings from database. (default is cp949)",
            default="cp949",
        )
        parser.add_argument("--all", action="store_true", default=False, dest="all", help="Specifies whether to load for all students")
        parser.add_argument("--studentid", dest="studentid", help="Specifies student id to load major")

    help = "Imports KAIST scholar database."
    args = "--host=143.248.X.Y:PORT --user=USERNAME"

    def handle(self, *args, **options):
        host = options.get("host", None)
        port = options.get("port", None)
        user = options.get("user", None)
        password = options.get("password", None)
        encoding = options.get("encoding")
        all_ = options.get("all", None)
        student_id = options.get("studentid", None)
        try:
            if password is None:
                password = getpass.getpass()
        except (KeyboardInterrupt, EOFError):
            print()
            return

        if all_:
            query = "SELECT * FROM view_report_e_degree_k"
        elif student_id is not None:
            query = "SELECT * FROM view_report_e_degree_k WHERE student_no=%d" % int(student_id)
        else:
            print("Target user not specified. Use argument [--studentid STUDENTID] or [--all].")
            return
        user_dept = execute(host, port, user, password, query)

        if all_:
            query = "SELECT * FROM view_kds_students_other_major"
        elif student_id is not None:
            query = "SELECT * FROM view_kds_students_other_major WHERE student_no=%d" % int(student_id)
        else:
            print("Target user not specified. Use argument [--studentid STUDENTID] or [--all].")
            return
        user_major_minor = execute(host, port, user, password, query)

        for a in user_dept:
            profile_matches = UserProfile.objects.filter(student_id=a[0])
            try:
                department = Department.objects.get(id=a[1])
            except Department.DoesNotExist:
                if len(profile_matches) > 0:
                    print("No department with id %d\n%s" % (a[1], a))
                continue

            for user in profile_matches:
                user.department = department
                user.save()

        for a in user_major_minor:
            profile_matches = UserProfile.objects.filter(student_id=a[0])
            departments = Department.objects.filter(name=a[2].decode(encoding))

            for user in profile_matches:
                for d in departments:
                    if a[1].decode(encoding) == "부전공신청":
                        user.minors.add(d)
                    elif a[1].decode("cp949") == "복수전공신청":
                        user.majors.add(d)
                    else:
                        print("Major/minor type not matching : " % (a.decode("cp959")))
