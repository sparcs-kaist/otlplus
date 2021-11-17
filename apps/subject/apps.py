from django.apps import AppConfig


class SubjectConfig(AppConfig):
    name = "apps.subject"

    def ready(self):
        from . import signals # pylint: disable=import-outside-toplevel, unused-import
