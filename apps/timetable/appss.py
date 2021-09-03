from django.apps import AppConfig


class TimetableConfig(AppConfig):
    name = "apps.timetable"

    def ready(self):
        from . import signals  # noqa: F401
