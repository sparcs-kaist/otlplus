from django.apps import AppConfig


class PlannerConfig(AppConfig):
    name = "apps.planner"
    
    def ready(self):
        from . import signals # pylint: disable=import-outside-toplevel, unused-import
