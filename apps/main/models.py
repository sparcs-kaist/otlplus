from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Lecture, Department, Course
from apps.review.models import Comment, MajorBestComment, LiberalBestComment

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


class FamousMajorReviewDailyFeed(DailyFeed):
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
            if reviews.count() < 3:
                return None
            selected_reviews = random.sample([r.comment for r in reviews], 3)
            feed = cls.objects.create(date=date, department=department, priority=random.random())
            feed.reviews.add(*selected_reviews)
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
    reviews = models.ManyToManyField(Comment)

    class Meta:
        unique_together = [['date']]

    @classmethod
    def get(cls, date):
        try:
            feed = cls.objects.get(date=date)
        except cls.DoesNotExist:
            reviews = LiberalBestComment.objects.filter(comment__lecture__type_en="Humanities & Social Elective")
            if reviews.count() < 3:
                return None
            selected_reviews = random.sample([r.comment for r in reviews], 3)
            feed = cls.objects.create(date=date, priority=random.random())
            feed.reviews.add(*selected_reviews)
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
    lecture = models.ForeignKey(Lecture)

    class Meta:
        unique_together = [['date', 'user']]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.take_lecture_list.all()
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            feed = cls.objects.create(date=date, user=user, lecture=selected_lecture, priority=random.random())
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
    course = models.ForeignKey(Course)

    class Meta:
        unique_together = [['date', 'user']]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.take_lecture_list.all()
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            feed = cls.objects.create(date=date, user=user, course=selected_lecture.course, priority=random.random())
        return feed

    def toJson(self, nested=False, user=None):
        result = {
            "type": "RELATED_COURSE",
            "date": self.date,
            "priority": self.priority,
            "course": self.course.toJson(nested=False),
        }
        return result

