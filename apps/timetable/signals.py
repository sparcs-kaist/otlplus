from .models import Timetable
from apps.subject.models import Lecture

from django.db.models.signals import m2m_changed, pre_delete
from django.dispatch import receiver


# Decrease num_people of lecture only if needed
def _decrease_num_people(lecture, user_profile):
    if Timetable.objects.filter(lectures=lecture, user=user_profile).count() == 1:
        lecture.num_people -= 1
        lecture.save()


# Increase num_people of lecture only if needed
def _increase_num_people(lecture, user_profile):
    if Timetable.objects.filter(lectures=lecture, user=user_profile).count() == 0:
        lecture.num_people += 1
        lecture.save()


@receiver(m2m_changed, sender=Timetable.lectures.through)
def timetable_lecture_changed(**kwargs):
    if kwargs["action"] == "pre_add":
        for lecture_id in kwargs["pk_set"]:
            _increase_num_people(Lecture.objects.get(id=lecture_id), kwargs["instance"].user)
    if kwargs["action"] == "pre_remove":
        for lecture_id in kwargs["pk_set"]:
            _decrease_num_people(Lecture.objects.get(id=lecture_id), kwargs["instance"].user)
    if kwargs["action"] == "pre_clear":
        for lecture in kwargs["instance"].lectures.all():
            _decrease_num_people(lecture, kwargs["instance"].user)


@receiver(pre_delete, sender=Timetable)
def timetable_deleted(**kwargs):
    for lecture in kwargs["instance"].lectures.all():
        _decrease_num_people(lecture, kwargs["instance"].user)
