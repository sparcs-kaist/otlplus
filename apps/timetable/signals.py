# -*- coding: utf-8 -*-

from apps.session.models import UserProfile
from apps.timetable.models import TimeTable, Wishlist
from apps.subject.models import Lecture, Professor, Course

from django.db.models.signals import m2m_changed, pre_delete
from django.dispatch import receiver



# Decrease num_people of lecture only if needed
def _decrease_num_people(lecture, userProfile):
    if len(TimeTable.objects.filter(lecture=lecture, user=userProfile)) == 1:
        lecture.num_people -= 1
        lecture.save()



# Increase num_people of lecture only if needed
def _increase_num_people(lecture, userProfile):
    if len(TimeTable.objects.filter(lecture=lecture, user=userProfile)) == 0:
        lecture.num_people += 1
        lecture.save()



@receiver(m2m_changed, sender=TimeTable.lecture.through)
def timetable_lecture_changed(**kwargs):
    if kwargs['action'] == 'pre_add':
        for id in kwargs['pk_set']:
            _increase_num_people(Lecture.objects.get(id=id),
                                 kwargs['instance'].user)
    if kwargs['action'] == 'pre_remove':
        for id in kwargs['pk_set']:
            _decrease_num_people(Lecture.objects.get(id=id),
                                 kwargs['instance'].user)
    if kwargs['action'] == 'pre_clear':
        for lecture in kwargs['instance'].lecture.all():
            _decrease_num_people(lecture,
                                 kwargs['instance'].user)



@receiver(pre_delete, sender=TimeTable)
def timetable_deleted(**kwargs):
    for lecture in kwargs['instance'].lecture.all():
        _decrease_num_people(lecture,
                             kwargs['instance'].user)
