# -*- coding: utf-8 -*-

from .models import Semester, Department, Lecture, Course

from django.core.cache import cache
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver


@receiver(post_save, sender=Semester)
def semester_saved(**kwargs):
    if not kwargs['created']:
        cache.delete(kwargs['instance'].getCacheKey())


@receiver(m2m_changed, sender=Lecture.professors.through)
def lecture_professors_changed(**kwargs):
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
    if not kwargs['created']:
        cache.delete(kwargs['instance'].getCacheKey(True))
        cache.delete(kwargs['instance'].getCacheKey(False))


@receiver(post_save, sender=Department)
def department_saved(**kwargs):
    if not kwargs['created']:
        cache.delete(kwargs['instance'].getCacheKey(True))
        cache.delete(kwargs['instance'].getCacheKey(False))


@receiver(post_save, sender=Course)
def course_saved(**kwargs):
    if not kwargs['created']:
        cache.delete(kwargs['instance'].getCacheKey(True))
        cache.delete(kwargs['instance'].getCacheKey(False))
