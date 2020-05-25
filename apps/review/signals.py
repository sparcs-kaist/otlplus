# -*- coding: utf-8 -*-

from apps.review.models import Review
from apps.subject.models import Lecture

from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


def _recalc_related_score(review):
    course = review.course
    lecture = review.lecture
    professors = lecture.professors.all()
    lectures = Lecture.objects.filter(course=course, professors__in=professors)
    related_list = [course]+list(lectures)+list(professors)
    for related in related_list:
        related.recalc_score()


@receiver(post_save, sender=Review)
def review_saved(**kwargs):
    review = kwargs['instance']
    _recalc_related_score(review)
    if kwargs['created']:
        course = review.course
        course.latest_written_datetime = review.written_datetime
        course.save()
    else:
        cache.delete("review:%d:nested" % review.id)
        cache.delete("review:%d:normal" % review.id)


@receiver(post_delete, sender=Review)
def review_deleted(**kwargs):
    review = kwargs['instance']
    _recalc_related_score(review)
