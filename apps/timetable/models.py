# -*- coding: utf-8
from django.db import models
from apps.subject.models import *
from apps.session.models import *


class TimeTable(models.Model):
    lecture = models.ManyToManyField(Lecture)
    user = models.ForeignKey(UserProfile, related_name="timetable_set", db_index=True)
    year = models.IntegerField(null=True, db_index=True)  # 몇넌도의 타임테이블인지
    semester = models.SmallIntegerField(null=True, db_index=True)  # 어떤학기의 타임테이블인지


class OldTimeTable(models.Model):
    lecture = models.ManyToManyField(Lecture)
    student_id = models.CharField(max_length=10)
    year = models.IntegerField(null=True)
    semester = models.SmallIntegerField(null=True)
    table_no = models.SmallIntegerField(null=True)

    def import_in(self):
        try:
            userprofile = UserProfile.objects.get(student_id=self.student_id)
        except UserProfile.DoesNotExist:
            print("User with student number %s does not exist." % self.student_id)
            return
        except UserProfile.MultipleObjectsReturned:
            if self.student_id == "":
                return
            else:
                print("User with student number %s has multiple userprofiles." % self.student_id)
                return
        timetable = TimeTable.objects.create(user=userprofile, year=self.year, semester=self.semester)
        for l in self.lecture.all():
            timetable.lecture.add(l)
        self.delete()

    @classmethod
    def import_in_for_user(cls, student_id):
        if student_id == "":
            return
        target = OldTimeTable.objects.filter(student_id=student_id)
        for t in target:
            t.import_in()


class Wishlist(models.Model):
    lectures = models.ManyToManyField(Lecture)
    user = models.OneToOneField(UserProfile, related_name="wishlist_set")
