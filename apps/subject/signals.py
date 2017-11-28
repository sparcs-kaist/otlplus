# -*- coding: utf-8 -*-

from apps.subject.models import Lecture

from django.db.models.signals import post_init, post_save
from django.dispatch import receiver



@receiver(post_init, sender=Lecture)
def timetable_lecture_changed(**kwargs):
    kwargs['instance'].update_class_title()



@receiver(post_save, sender=Lecture)
def timetable_lecture_changed(**kwargs):
    post_save.disconnect(timetable_lecture_changed, sender=Lecture)
    kwargs['instance'].update_class_title()
    post_save.connect(timetable_lecture_changed, sender=Lecture)
