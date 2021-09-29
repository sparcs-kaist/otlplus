from django.apps import AppConfig


class MainConfig(AppConfig):
    name = "apps.main"

    def ready(self):
        from . import signals # pylint: disable=import-outside-toplevel, unused-import
