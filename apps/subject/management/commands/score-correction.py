# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Course,  Lecture, Professor
from apps.review.models import Review
class Command(BaseCommand):
    help = '--score correction--'
    def handle(related, *args, **options):
        print("score correction start!")
        print("initializing..")

        courses = Course.objects.all()
        lectures = Lecture.objects.all()
        professors = Professor.objects.all()
        related_list = list(courses) + list(lectures) + list(professors)
        related_len = len(related_list)
        i = 0
        for r in related_list:
            r.recalc_score()
            print("{i} / {related_len}")
            i+=1
        print("score correction ended!")

