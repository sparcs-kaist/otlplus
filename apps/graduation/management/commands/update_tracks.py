import os
from typing import List, Type, Union

from django.core.management.base import BaseCommand
from apps.graduation.models import GeneralTrack, MajorTrack, AdditionalTrack, UNBOUND_START_YEAR, UNBOUND_END_YEAR
from apps.subject.models import Department


class Command(BaseCommand):
    DELIMITER = ","

    def parse_and_update(self, filename: str,
                         TrackClass: Type[Union[GeneralTrack, MajorTrack, AdditionalTrack]],
                         key_field_names: List[str]):
        file = open(filename, "r")
        lines = file.readlines()
        labels = lines[0].strip().split(Command.DELIMITER)
        for l in lines[1:]:
            words = l.strip().split(Command.DELIMITER)
            fields = dict(zip(labels, words))
            if fields["start_year"] == "":
                fields["start_year"] = UNBOUND_START_YEAR
            if fields["end_year"] == "":
                fields["end_year"] = UNBOUND_END_YEAR
            if "department" in fields:
                fields["department"] = Department.objects.filter(code=fields["department"], visible=True).last() \
                                           if fields["department"] != "" \
                                           else None
            key_fields = {k: v for k, v in fields.items() if k in key_field_names}
            target_tracks = TrackClass.objects.filter(**key_fields)
            if len(target_tracks) != 0:
                target_tracks.update(**fields)
            else:
                TrackClass.objects.create(**fields)

        file.close()

    def handle(self, *args, **options):
        self.parse_and_update(
            os.path.join(
                os.path.abspath(os.path.dirname('manage.py')),
                'apps/graduation/data/general.csv'
            ),
            GeneralTrack,
            ["start_year", "end_year", "department"],
        )
        self.parse_and_update(
            os.path.join(
                os.path.abspath(os.path.dirname('manage.py')),
                'apps/graduation/data/major.csv'
            ),
            MajorTrack,
            ["start_year", "end_year", "is_foreign"],
        )
        self.parse_and_update(
            os.path.join(
                os.path.abspath(os.path.dirname('manage.py')),
                'apps/graduation/data/additional.csv'
            ),
            AdditionalTrack,
            ["start_year", "end_year", "type", "department"],
        )
