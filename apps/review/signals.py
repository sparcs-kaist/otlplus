# -*- coding: utf-8 -*-

from apps.review.models import Review
from apps.subject.models import Lecture

from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


def _recalc_related_score(review):
    related_list = review.get_score_related_list()
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
        cache.delete(review.getCacheKey(True))
        cache.delete(review.getCacheKey(False))


@receiver(post_delete, sender=Review)
def review_deleted(**kwargs):
    review = kwargs['instance']
    _recalc_related_score(review)
