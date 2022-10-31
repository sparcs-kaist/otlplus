import random
import datetime

from django.db import models
from django.utils import timezone

from apps.session.models import UserProfile
from apps.subject.models import Lecture, Department, Course, Semester
from apps.review.models import Review, MajorBestReview, HumanityBestReview
from apps.support.models import Rate


class DailyFeed(models.Model):
    date = models.DateField()
    priority = models.FloatField()
    visible = models.BooleanField()

    class Meta:
        unique_together = [["date"]]
        abstract = True


class DailyUserFeed(DailyFeed):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    class Meta:
        unique_together = [["date", "user"]]
        abstract = True


class FamousMajorReviewDailyFeed(DailyFeed):
    VISIBLE_RATE_BASE = 0.6

    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    reviews = models.ManyToManyField(Review)

    class Meta:
        unique_together = [["date", "department"]]

    @classmethod
    def get(cls, date, department, departments_num=1):
        try:
            feed = cls.objects.get(date=date, department=department)
        except cls.DoesNotExist:
            reviews = MajorBestReview.objects.filter(review__lecture__department=department)
            if reviews.count() < 3:
                selected_reviews = reviews[:]
                visible = False
            else:
                selected_reviews = random.sample([r.review for r in reviews], 3)
                visible = random.random() < (cls.VISIBLE_RATE_BASE / (departments_num ** 0.7))
            feed = cls.objects.create(date=date, department=department, priority=random.random(),
                                      visible=visible)
            feed.reviews.add(*selected_reviews)
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        result = {
            "type": "FAMOUS_MAJOR_REVIEW",
            "date": self.date,
            "priority": self.priority,
            "department": self.department.to_json(nested=False),
            "reviews": [r.to_json(user=user) for r in self.reviews.all()],
        }
        return result


class FamousHumanityReviewDailyFeed(DailyFeed):
    VISIBLE_RATE_BASE = 0.5

    reviews = models.ManyToManyField(Review)

    class Meta:
        unique_together = [["date"]]

    @classmethod
    def get(cls, date):
        try:
            feed = cls.objects.get(date=date)
        except cls.DoesNotExist:
            reviews = HumanityBestReview.objects.filter(review__lecture__type_en__startswith=
                                                        "Humanities & Social Elective")
            if reviews.count() < 3:
                selected_reviews = reviews[:]
                visible = False
            else:
                selected_reviews = random.sample([r.review for r in reviews], 3)
                visible = random.random() < cls.VISIBLE_RATE_BASE
            feed = cls.objects.create(date=date, priority=random.random(), visible=visible)
            feed.reviews.add(*selected_reviews)
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        result = {
            "type": "FAMOUS_HUMANITY_REVIEW",
            "date": self.date,
            "priority": self.priority,
            "reviews": [r.to_json(user=user) for r in self.reviews.all()],
        }
        return result


class RankedReviewDailyFeed(DailyFeed):
    VISIBLE_RATE_BASE = 0.15

    semester = models.ForeignKey(Semester, null=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = [['date']]

    @classmethod
    def get(cls, date):
        try:
            feed = cls.objects.get(date=date)
        except cls.DoesNotExist:
            semester = None
            visible = random.random() < cls.VISIBLE_RATE_BASE
            feed = cls.objects.create(date=date, semester=semester, priority=random.random(),
                                      visible=visible)
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        if self.semester is None:
            reviews = Review.objects.all()
        else:
            reviews = Review.objects.filter(lecture__year=self.semester.year,
                                            lecture__semester=self.semester.semester)
        reviews = reviews.order_by("-like").distinct()[:3]
        result = {
            "type": "RANKED_REVIEW",
            "date": self.date,
            "priority": self.priority,
            "semester": self.semester.to_json() if (self.semester is not None) else None,
            "reviews": [r.to_json(user=user) for r in reviews],
        }
        return result


class ReviewWriteDailyUserFeed(DailyUserFeed):
    VISIBLE_RATE_BASE = 0.6

    lecture = models.ForeignKey(Lecture, on_delete=models.PROTECT)

    class Meta:
        unique_together = [["date", "user"]]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.review_writable_lectures
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            visible = random.random() < cls.VISIBLE_RATE_BASE
            feed = cls.objects.create(
                date=date,
                user=user,
                lecture=selected_lecture,
                priority=random.random(),
                visible=visible,
            )
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        result = {
            "type": "REVIEW_WRITE",
            "date": self.date,
            "priority": self.priority,
            "lecture": self.lecture.to_json(nested=False),
        }
        return result


class RelatedCourseDailyUserFeed(DailyUserFeed):
    VISIBLE_RATE_BASE = 0.45

    course = models.ForeignKey(Course, on_delete=models.PROTECT)

    class Meta:
        unique_together = [["date", "user"]]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            taken_lectures = user.taken_lectures.all()
            if taken_lectures.count() == 0:
                return None
            selected_lecture = random.choice(taken_lectures)
            visible = random.random() < cls.VISIBLE_RATE_BASE
            feed = cls.objects.create(
                date=date,
                user=user,
                course=selected_lecture.course,
                priority=random.random(),
                visible=visible,
            )
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        result = {
            "type": "RELATED_COURSE",
            "date": self.date,
            "priority": self.priority,
            "course": self.course.to_json(nested=False),
        }
        return result


class RateDailyUserFeed(DailyUserFeed):
    VISIBLE_RATE_BASE = 0.25
    MIN_DAYS_INTERVAL = 3

    class Meta:
        unique_together = [["date", "user"]]

    @classmethod
    def get(cls, date, user):
        try:
            feed = cls.objects.get(date=date, user=user)
        except cls.DoesNotExist:
            if Rate.objects.filter(user=user, year=timezone.now().year).exists():
                return None
            date_datetime = datetime.datetime(int(date[0:4]), int(date[5:7]), int(date[8:10]))
            if RateDailyUserFeed.objects.filter(
                    date__gt=date_datetime - datetime.timedelta(days=cls.MIN_DAYS_INTERVAL),
                    date__lt=date_datetime + datetime.timedelta(days=cls.MIN_DAYS_INTERVAL),
                    user=user,
                    visible=True,
                ).exists():
                return None
            visible = random.random() < cls.VISIBLE_RATE_BASE
            feed = cls.objects.create(date=date, user=user, priority=random.random(),
                                      visible=visible)
        if not feed.visible:
            return None
        else:
            return feed

    def to_json(self, nested=False, user=None):
        result = {
            "type": "RATE",
            "date": self.date,
            "priority": self.priority,
            "rated": Rate.objects.filter(user=self.user, year=timezone.now().year).exists(),
        }
        return result
