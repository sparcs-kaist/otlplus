# -*- coding: utf-8 -*-

from apps.subject.models import Lecture

from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver



@receiver(m2m_changed, sender=Lecture.professor.through)
def lecture_professor_changed(**kwargs):
    if kwargs['action'] == 'post_add' or \
       kwargs['action'] == 'post_remove' or \
       kwargs['action'] == 'post_clear':
        kwargs['instance'].recalc_score()



@receiver(post_save, sender=Lecture)
def lecture_saved(**kwargs):
    post_save.disconnect(lecture_saved, sender=Lecture)
    kwargs['instance'].update_class_title()
    post_save.connect(lecture_saved, sender=Lecture)
