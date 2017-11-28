# -*- coding: utf-8 -*-

from apps.session.models import UserProfile
from apps.timetable.models import Lecture
from apps.review.models import Comment

from django.db.models.signals import m2m_changed, pre_delete
from django.dispatch import receiver



@receiver(m2m_changed, sender=Lecture.professor.through)
def timetable_lecture_changed(**kwargs):
    if kwargs['action'] == 'post_add' or \
       kwargs['action'] == 'post_remove' or \
       kwargs['action'] == 'post_clear':
        kwargs['instance'].recalc_score()
