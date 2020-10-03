# -*- coding: utf-8 -*-

from apps.session.models import UserProfile
from .models import Timetable, Wishlist
from apps.subject.models import Lecture, Professor, Course

from django.db.models.signals import m2m_changed, pre_delete
from django.dispatch import receiver



# Decrease num_people of lecture only if needed
def _decrease_num_people(lecture, userProfile):
    if len(Timetable.objects.filter(lectures=lecture, user=userProfile)) == 1:
        lecture.num_people -= 1
        lecture.save()



# Increase num_people of lecture only if needed
def _increase_num_people(lecture, userProfile):
    if len(Timetable.objects.filter(lectures=lecture, user=userProfile)) == 0:
        lecture.num_people += 1
        lecture.save()



@receiver(m2m_changed, sender=Timetable.lectures.through)
def timetable_lecture_changed(**kwargs):
    if kwargs['action'] == 'pre_add':
        for li in kwargs['pk_set']:
            _increase_num_people(Lecture.objects.get(id=li),
                                 kwargs['instance'].user)
    if kwargs['action'] == 'pre_remove':
        for li in kwargs['pk_set']:
            _decrease_num_people(Lecture.objects.get(id=li),
                                 kwargs['instance'].user)
    if kwargs['action'] == 'pre_clear':
        for l in kwargs['instance'].lectures.all():
            _decrease_num_people(l,
                                 kwargs['instance'].user)



@receiver(pre_delete, sender=Timetable)
def timetable_deleted(**kwargs):
    for l in kwargs['instance'].lectures.all():
        _decrease_num_people(l,
                             kwargs['instance'].user)
