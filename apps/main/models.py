from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Lecture, Department, Course
from apps.review.models import Review, MajorBestReview, HumanityBestReview

import random

# Create your models here.

class DailyFeed(models.Model):
    date = models.DateField()
    priority = models.FloatField()
    visible = models.BooleanField()

    class Meta:
        unique_together = [['date']]
        abstract = True


class DailyUserFeed(DailyFeed):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    class Meta:
        unique_together = [['date', 'user']]
        abstract=True


class FamousMajorReviewDailyFeed(DailyFeed):
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    reviews = models.ManyToManyField(Review)

    class Meta:
        unique_together = [['date', 'department']]

    @classmethod
    def get(cls, date, department):
        try:
            feed = cls.objects.get(date=date, department=department)
        except cls.DoesNotExist:
            reviews = MajorBestReview.objects.filter(review__lecture__department=department)
            if reviews.count() < 3:
                selected_reviews = reviews[:]
                visible = False
            else:
                selected_reviews = random.sample([r.review for r in reviews], 3)
                visible = random.random() < 0.7
            feed = cls.objects.create(date=date, department=department, priority=random.random(), visible=visible)
            feed.reviews.add(*selected_reviews)
        if not feed.visible:
            return None
        else:
            return feed

    def toJson(self, nested=False, user=None):
        result = {
            "type": "FAMOUS_MAJOR_REVIEW",
            "date": self.date,
            "priority": self.priority,
            "department": self.department.toJson(nested=False),
            "reviews": [r.toJson(nested=False, user=user) for r in self.reviews.all()]
        }
        return result


class FamousHumanityReviewDailyFeed(DailyFeed):
    reviews = models.ManyToManyField(Review)

    class Meta:
        unique_together = [['date']]

    @classmethod
    def get(cls, date):
        try:
            feed = cls.objects.get(date=date)
        except cls.DoesNotExist:
            reviews = HumanityBestReview.objects.filter(review__lecture__type_en="Humanities & Social Elective")
            if reviews.count() < 3:
                selected_reviews = reviews[:]
                visible = False
            else:
                selected_reviews = random.sample([r.review for r in reviews], 3)
                visible = random.random() < 0.7
            feed = cls.objects.create(date=date, priority=random.random(), visible=visible)
            feed.reviews.add(*selected_reviews)
        if not feed.visible:
            return None
        else:
            return feed

    def toJson(self, nested=False, user=None):
        result = {
            "type": "FAMOUS_HUMANITY_REVIEW",
            "date": self.date,
            "priority": self.priority,
            "reviews": [r.toJson(nested=False, user=user) for r in self.reviews.all()]
        }
        return result


class ReviewWriteDailyUserFeed(DailyUserFeed):
    lecture = models.ForeignKey(Lecture, on_delete=models.PROTECT)

    class Meta:
        unique_together = [['date', 'user']]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.getReviewWritableLectureList()
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            feed = cls.objects.create(date=date, user=user, lecture=selected_lecture, priority=random.random(), visible=random.random() < 0.7)
        if not feed.visible:
            return None
        else:
            return feed

    def toJson(self, nested=False, user=None):
        result = {
            "type": "REVIEW_WRITE",
            "date": self.date,
            "priority": self.priority,
            "lecture": self.lecture.toJson(nested=False),
        }
        return result


class RelatedCourseDailyUserFeed(DailyUserFeed):
    course = models.ForeignKey(Course, on_delete=models.PROTECT)

    class Meta:
        unique_together = [['date', 'user']]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.taken_lectures.all()
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            feed = cls.objects.create(date=date, user=user, course=selected_lecture.course, priority=random.random(), visible=random.random() < 0.7)
        if not feed.visible:
            return None
        else:
            return feed

    def toJson(self, nested=False, user=None):
        result = {
            "type": "RELATED_COURSE",
            "date": self.date,
            "priority": self.priority,
            "course": self.course.toJson(nested=False),
        }
        return result

