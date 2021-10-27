import os
import datetime
import json
import random
from typing import List, Dict


INDENT = 2


def _drop_instance(target_json: List[Dict], model: str, keeping_rate: float):
    for d in list(target_json):
        if d['model'] != model:
            continue
        random.seed(f'{model}-{d["pk"]}')
        if random.random() > keeping_rate:
            target_json.remove(d)


def _clear_field(target_json: List[Dict], model: str, field: str):
    for d in target_json:
        if d['model'] != model:
            continue
        d['fields'][field] = None


def dump_data():
    target_dir = 'dumps/data'
    today = datetime.date.today()
    date_str = today.strftime('%y%m%d')

    subject_filename = f'{target_dir}/otldump_{date_str}_subject.json'
    os.system(f'python manage.py dumpdata ' \
              f'subject.Semester subject.Lecture subject.ExamTime subject.ClassTime ' \
              f'subject.Department subject.Course subject.Professor ' \
              f'--indent {INDENT} --output {subject_filename}')

    review_filename = f'{target_dir}/otldump_{date_str}_review.json'
    os.system(f'python manage.py dumpdata ' \
              f'review.Review review.ReviewVote review.MajorBestReview review.HumanityBestReview ' \
              f'--indent {INDENT} --output {review_filename}')
    review_json = json.load(open(review_filename))
    _drop_instance(review_json, 'review.review', 0.4)
    _clear_field(review_json, 'review.review', 'writer')
    _clear_field(review_json, 'review.reviewvote', 'userprofile')
    json.dump(review_json, open(review_filename, 'w'), indent=INDENT)


if __name__ == '__main__':
    dump_data()
