import json
from typing import List, Dict

from django.conf import settings
from django.core import management
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(dest="info-filename", help="Specifies date that data was dumped.")


    def handle(self, *args, **options):
        info_filename = options.get("info-filename")

        if not settings.DEBUG:
            print("settings.DEBUG is set to False. This command should only be executed on development server")
            return

        self._load_data(info_filename)


    def _load_data(self, info_filename: str):
        info_json = json.load(open(info_filename))
        
        if settings.VERSION != info_json['version']:
            print("WARNING: OTL version does not match dumped version.")

        management.call_command('loaddata',
                                *info_json['files'],
                                verbosity=3)
