from django.apps import AppConfig



class SubjectConfig(AppConfig):
    name = "apps.subject"
    def ready( self ):
        import apps.subject.signals
