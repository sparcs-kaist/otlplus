import datetime
import json
import random
from typing import List, Dict, Callable

from django.conf import settings
from django.core import management
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    REVIEW_KEEPING_RATE = 0.25


    def handle(self, *args, **options):
        self._dump_data()


    def _drop_instance(self, target_json: List[Dict], model: str, keeping_rate: float,
                       seed_func: Callable[[Dict], str]=(lambda x: x["pk"])):
        for d in list(target_json):
            if d['model'] != model:
                continue
            random.seed(seed_func(d))
            if random.random() > keeping_rate:
                target_json.remove(d)


    def _clear_field(self, target_json: List[Dict], model: str, field: str):
        for d in target_json:
            if d['model'] != model:
                continue
            d['fields'][field] = None


    def _dump_data(self):
        INDENT = 2

        target_dir = 'dumps'
        today = datetime.date.today()
        date_str = today.strftime('%y%m%d')

        info_filename = f'{target_dir}/otldump_{date_str}_info.json'
        subject_filename = f'{target_dir}/otldump_{date_str}_subject.json'
        review_filename = f'{target_dir}/otldump_{date_str}_review.json'

        info_json = {
            'date': today.isoformat(),
            'version': settings.VERSION,
            'review_keeping_rate': Command.REVIEW_KEEPING_RATE,
            'files': [subject_filename, review_filename],
        }
        json.dump(info_json, open(info_filename, 'w'), indent=INDENT)

        management.call_command('dumpdata',
                                'subject.Semester',
                                'subject.Department', 'subject.Professor', 'subject.Course',
                                'subject.Lecture', 'subject.ExamTime', 'subject.ClassTime',
                                indent=INDENT, output=subject_filename)

        management.call_command('dumpdata',
                                'review.Review', 'review.ReviewVote',
                                indent=INDENT, output=review_filename)
        review_json = json.load(open(review_filename))
        self._drop_instance(review_json, 'review.review', Command.REVIEW_KEEPING_RATE, lambda r: f'review-{r["pk"]}')
        self._drop_instance(review_json, 'review.reviewvote', Command.REVIEW_KEEPING_RATE, lambda r: f'review-{r["fields"]["review"]}')
        self._clear_field(review_json, 'review.review', 'writer')
        self._clear_field(review_json, 'review.reviewvote', 'userprofile')
        json.dump(review_json, open(review_filename, 'w'), indent=INDENT)
