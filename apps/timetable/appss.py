from django.apps import AppConfig



class TimetableConfig(AppConfig):
    name = "apps.timetable"
    def ready( self ):
        import apps.timetable.signals
