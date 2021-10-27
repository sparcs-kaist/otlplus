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

        self._load_data(info_filename)


    def _load_data(self, info_filename: str):
        info_json = json.load(open(info_filename))

        management.call_command('loaddata',
                                *info_json['files'],
                                verbosity=3)
