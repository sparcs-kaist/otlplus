# -*- coding: utf-8 -*-

from django.core.cache import cache
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver

from .models import Semester, Department, Lecture, Course


@receiver(post_save, sender=Semester)
def semester_saved(**kwargs):
    if not kwargs["created"]:
        cache.delete(kwargs["instance"].get_cache_key())


@receiver(m2m_changed, sender=Lecture.professors.through)
def lecture_professors_changed(**kwargs):
    if kwargs["action"] == "post_add" \
       or kwargs["action"] == "post_remove" \
       or kwargs["action"] == "post_clear":
        kwargs["instance"].recalc_score()


def _check_class_title_update_required(lecture):
    is_title_equal = lecture.title in [lecture.common_title + lecture.class_title, lecture.common_title]
    is_title_en_equal = lecture.title_en in [lecture.common_title_en + lecture.class_title_en, lecture.common_title_en]
    return not (is_title_equal and is_title_en_equal)


@receiver(post_save, sender=Lecture)
def lecture_saved(**kwargs):
    update_fields = kwargs["update_fields"]
    if update_fields is None:
        if _check_class_title_update_required(kwargs["instance"]):
            kwargs["instance"].update_class_title()
    elif "common_title" not in update_fields \
         and "class_title" not in update_fields \
         and "common_title_en" not in update_fields \
         and "class_title_en" not in update_fields:
        if _check_class_title_update_required(kwargs["instance"]):
            kwargs["instance"].update_class_title()
    else:
        pass
    if not kwargs["created"]:
        cache.delete(kwargs["instance"].get_cache_key(True))
        cache.delete(kwargs["instance"].get_cache_key(False))


@receiver(post_save, sender=Department)
def department_saved(**kwargs):
    if not kwargs["created"]:
        cache.delete(kwargs["instance"].get_cache_key(True))
        cache.delete(kwargs["instance"].get_cache_key(False))


@receiver(post_save, sender=Course)
def course_saved(**kwargs):
    if not kwargs["created"]:
        cache.delete(kwargs["instance"].get_cache_key(True))
        cache.delete(kwargs["instance"].get_cache_key(False))
