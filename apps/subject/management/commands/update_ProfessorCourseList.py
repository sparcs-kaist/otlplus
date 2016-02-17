from django.core.management.base import BaseCommand
from apps.subject.models import Course, Professor
class Command(BaseCommand):
    help = "update Professors' course_list"
    def handle(self, *args, **options):
        print "start updating Professors' course_list"
        for aCourse in list(Course.objects.all()):
            for aProfessor in list(aCourse.professors.all()):
                aProfessor.course_list.add(aCourse)
        print "Professors' course_list changed"
    
