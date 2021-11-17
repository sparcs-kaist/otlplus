from django.apps import AppConfig


class TimetableConfig(AppConfig):
    name = "apps.timetable"

    def ready(self):
        from . import signals # pylint: disable=import-outside-toplevel, unused-import
