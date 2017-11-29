# -*- coding: utf-8 -*-

from apps.subject.models import Lecture, Course

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
    update_fields = kwargs['update_fields']
    if update_fields is None:
        kwargs['instance'].update_class_title()
    elif 'common_title' not in update_fields and \
       'class_title' not in update_fields and \
       'common_title_en' not in update_fields and \
       'class_title_en' not in update_fields:
        kwargs['instance'].update_class_title()
    else:
        pass



@receiver(post_save, sender=Course)
def course_saved(**kwargs):
    update_fields = kwargs['update_fields']
    if update_fields is None:
        kwargs['instance'].update_code_num()
    elif 'code_num' not in update_fields:
        kwargs['instance'].update_code_num()
    else:
        pass
