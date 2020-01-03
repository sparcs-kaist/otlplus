from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Lecture, Department
from apps.review.models import Comment, MajorBestComment

import random

# Create your models here.

class RandomCourseReco(models.Model):
    userprofile = models.ForeignKey(UserProfile, related_name="random_course_reco", on_delete=models.SET_NULL, null=True)
    reco_date = models.DateField()
    lecture = models.ForeignKey(Lecture, db_index=True)

    def __unicode__(self):
        return u"User: %s, RecoDate: %s, Lecture: %s" % (self.userprofile, self.reco_date, self.lecture)


class DailyFeed(models.Model):
    date = models.DateField()
    priority = models.FloatField()

    class Meta:
        unique_together = [['date']]
        abstract = True


class DailyUserFeed(DailyFeed):
    user = models.ForeignKey(UserProfile)

    class Meta:
        unique_together = [['date', 'user']]
        abstract=True


class FamousReviewDailyFeed(DailyFeed):
    department = models.ForeignKey(Department)
    reviews = models.ManyToManyField(Comment)

    class Meta:
        unique_together = [['date', 'department']]

    @classmethod
    def get(cls, date, department):
        try:
            feed = cls.objects.get(date=date, department=department)
        except cls.DoesNotExist:
            reviews = MajorBestComment.objects.filter(comment__lecture__department=department)
            selected_reviews = random.sample([r.comment for r in reviews], 3)
            feed = cls.objects.create(date=date, department=department, priority=random.random())
            feed.reviews.add(*selected_reviews)
        return feed

    def toJson(self, nested=False):
        result = {
            "date": self.date,
            "priority": self.priority,
            "department": self.department.toJson(nested=False),
            "reviews": [r.toJson(nested=False) for r in self.reviews.all()]
        }
        return result

