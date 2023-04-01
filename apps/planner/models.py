from __future__ import annotations

from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department
from apps.graduation.models import GeneralTrack, MajorTrack, AdditionalTrack


class Planner(models.Model):
    user = models.ForeignKey(UserProfile,
                             related_name="planners", on_delete=models.CASCADE, db_index=True)
    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    general_track = models.ForeignKey(GeneralTrack, on_delete=models.PROTECT)
    major_track = models.ForeignKey(MajorTrack, on_delete=models.PROTECT)
    additional_tracks = models.ManyToManyField(AdditionalTrack)
    
    arrange_order = models.SmallIntegerField(db_index=True)

    def to_json(self, nested=False):
        result = {
            "id": self.id,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "general_track": self.general_track.to_json(),
            "major_track": self.major_track.to_json(),
            "additional_tracks": [at.to_json() for at in self.additional_tracks.all()],
            "taken_items": [takenPlannerItem.to_json()
                             for takenPlannerItem in self.taken_items.all()],
            "future_items": [futurePlannerItem.to_json()
                             for futurePlannerItem in self.future_items.all()],
            "arbitrary_items": [arbitraryPlannerItem.to_json()
                             for arbitraryPlannerItem in self.arbitrary_items.all()],
            "arrange_order": self.arrange_order,
        }
        return result

    @classmethod
    def get_related_planners(cls, user):
        return Planner.objects.filter(user=user)
    


class TakenPlannerItem(models.Model):
    planner = models.ForeignKey(Planner,
                                related_name="taken_items", on_delete=models.CASCADE, db_index=True)

    lecture = models.ForeignKey(Lecture, on_delete=models.PROTECT)

    class Meta:
        unique_together = [["planner", "lecture"]]
    
    def to_json(self):
        result = {
            "id": self.id,
            "item_type": "TAKEN",
            "lecture": self.lecture.to_json(nested=False),
            "course": self.lecture.course.to_json(nested=False),
        }

        return result


class FuturePlannerItem(models.Model):
    planner = models.ForeignKey(Planner,
                                related_name="future_items", on_delete=models.CASCADE, db_index=True)

    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    
    def to_json(self):
        result = {
            "id": self.id,
            "item_type": "FUTURE",
            "year": self.year,
            "semester": self.semester,
            "course": self.course.to_json(nested=False),
        }

        return result


class ArbitraryPlannerItem(models.Model):
    planner = models.ForeignKey(Planner,
                                related_name="arbitrary_items", on_delete=models.CASCADE,
                                db_index=True)
    
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.PROTECT)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    credit = models.IntegerField()
    credit_au = models.IntegerField()

    def to_json(self):
        result = {
            "id": self.id,
            "item_type": "ARBITRARY",
            "year": self.year,
            "semester": self.semester,
            "department": self.department.to_json(nested=False),
            "type": self.type,
            "type_en": self.type_en,
            "credit": self.credit,
            "credit_au": self.credit_au,
        }

        return result
