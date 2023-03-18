from __future__ import annotations

from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Course


class Planner(models.Model):
    user = models.ForeignKey(UserProfile,
                             related_name="planners", on_delete=models.CASCADE, db_index=True)
    start_year = models.IntegerField(db_index=True)
    arrange_order = models.SmallIntegerField(db_index=True)

    @classmethod
    def get_related_planners(cls, user):
        return Planner.objects.filter(user=user)
    

class PlannerItem(models.Model):
    planner = models.ForeignKey(Planner, on_delete=models.PROTECT, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)

    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    
    def to_json(self):
        result = {
            "planner": self.planner,
            "year": self.year,
            "semester": self.semester,
            "course": self.course.to_json(nested=True),
        }

        return result
