from django.apps import AppConfig



class SessionConfig(AppConfig):
    name = "apps.session"
    def ready( self ):
        from . import signals
