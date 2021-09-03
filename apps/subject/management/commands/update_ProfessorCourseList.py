from django.core.management.base import BaseCommand
from apps.subject.models import Course


class Command(BaseCommand):
    help = "update Professors' course_list"

    def handle(self, *args, **options):
        print("start updating Professors' course_list")
        for c in list(Course.objects.all()):
            for p in list(c.professors.all()):
                p.course_list.add(c)
        print("Professors' course_list changed")
