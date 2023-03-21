from django.apps import AppConfig


class GraduationConfig(AppConfig):
    name = "apps.graduation"
    
    def ready(self):
        from . import signals # pylint: disable=import-outside-toplevel, unused-import
