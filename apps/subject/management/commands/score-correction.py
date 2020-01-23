# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Course,  Lecture, Professor
from apps.review.models import Review
class Command(BaseCommand):
    help = '--score correction--'
    def handle(related, *args, **options):
        print "score correction start!"
        print "initializing.."

        courses = Course.objects.all()
        lectures = Lecture.objects.all()
        professors = Professor.objects.all()
        related_list = list(courses) + list(lectures) + list(professors)
        related_len = len(related_list)
        i = 0
        for related in related_list:
            related.grade_sum = 0
            related.load_sum = 0
            related.speech_sum = 0
            related.total_sum = 0
            related.review_num = 0
            related.avg_update()
            related.save()
            print str(i) + " / " + str(related_len)
            i+=1
        print "initialize completed!"
        for review in Review.objects.all():
            if review.grade == 0 or \
               review.load == 0 or \
               review.speech == 0:
                # Review with scores '?'
                continue

            course = review.course
            professors = review.lecture.professors.all()
            lectures = Lecture.objects.filter(course=course, professors__in=professors)
            related_list = [course]+list(lectures)+list(professors)
            for related in related_list:
                related.grade_sum += (review.like+1)*review.grade*3
                related.load_sum += (review.like+1)*review.load*3
                related.speech_sum += (review.like+1)*review.speech*3
                related.total_sum += (review.like+1)*review.total*3
                related.review_num += review.like+1
                related.avg_update()
                related.save()
            print str(review.written_datetime) + " : updated"
        print "score correction ended!"

