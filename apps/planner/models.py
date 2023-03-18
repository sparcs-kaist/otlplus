from __future__ import annotations

from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Course


class Planner(models.Model):
    user = models.ForeignKey(UserProfile,
                             related_name="planners", on_delete=models.CASCADE, db_index=True)
    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    arrange_order = models.SmallIntegerField(db_index=True)

    def to_json(self, nested=False):
        result = {
            "id": self.id,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "future_items": [futurePlannerItem.toJson()
                             for futurePlannerItem in self.future_items.all()],
            "arrange_order": self.arrange_order,
        }
        return result

    @classmethod
    def get_related_planners(cls, user):
        return Planner.objects.filter(user=user)
    

class FuturePlannerItem(models.Model):
    planner = models.ForeignKey(Planner,
                                related_name="future_items", on_delete=models.CASCADE, db_index=True)

    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    
    def to_json(self):
        result = {
            "year": self.year,
            "semester": self.semester,
            "course": self.course.to_json(nested=True),
        }

        return result
