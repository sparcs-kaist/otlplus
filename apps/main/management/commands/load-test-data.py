from django.core.management.base import BaseCommand

from tests.fixtures.course import _import_course_data


class Command(BaseCommand):
    help = "Load data used for testing"

    def handle(self, *args, **options):
        _import_course_data()
