# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Course,  Lecture, Professor
from apps.review.models import Comment
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
            related.comment_num = 0
            related.avg_update()
            related.save()
            print str(i) + " / " + str(related_len)
            i+=1
        print "initialize completed!"
        for comment in Comment.objects.all():
            if comment.grade == 0 or \
               comment.load == 0 or \
               comment.speech == 0:
                # Comment with scores '?'
                continue

            course = comment.course
            professors = comment.lecture.professor.all()
            lectures = Lecture.objects.filter(course=course, professor__in=professors)
            related_list = [course]+list(lectures)+list(professors)
            for related in related_list:
                related.grade_sum += (comment.like+1)*comment.grade*3
                related.load_sum += (comment.like+1)*comment.load*3
                related.speech_sum += (comment.like+1)*comment.speech*3
                related.total_sum += (comment.like+1)*comment.total*3
                related.comment_num += comment.like+1
                related.avg_update()
                related.save()
            print str(comment.written_datetime) + " : updated"
        print "score correction ended!"

