# -*- coding: utf-8 -*-
from django.db import models
from django.core.cache import cache
from apps.subject.models import Course, Lecture, Professor
from apps.session.models import UserProfile


class Review(models.Model):
    course = models.ForeignKey(Course, on_delete=models.PROTECT, db_index=True, related_name='reviews')
    lecture = models.ForeignKey(Lecture, on_delete=models.PROTECT, db_index=True, related_name='reviews')

    content = models.CharField(max_length=65536)
    grade = models.SmallIntegerField(default=0)
    load = models.SmallIntegerField(default=0)
    speech = models.SmallIntegerField(default=0)

    writer = models.ForeignKey(UserProfile, related_name='reviews', db_index=True, on_delete=models.SET_NULL, null=True)
    writer_label = models.CharField(max_length=200, default=u"무학과 넙죽이")
    updated_datetime = models.DateTimeField(auto_now=True, db_index=True)
    written_datetime = models.DateTimeField(auto_now_add=True, db_index=True, null=True)
    like = models.IntegerField(default=0)
    is_deleted = models.IntegerField(default=0)

    class Meta:
        unique_together = (
            ("writer", "lecture",)
        )

    def getCacheKey(self, nested):
        return "review:%d:%s" % (self.id, 'nested' if nested else 'normal')

    def toJson(self, nested=False, user=None):
        def addUserspecificData(result, user):
            is_liked = True
            if (not user) or (not user.is_authenticated()):
                is_liked = False
            else:
                is_liked = ReviewVote.objects.filter(review = self, userprofile__user = user).exists()
            result.update({
                'userspecific_is_liked': is_liked,
            })

        cache_id = self.getCacheKey(nested)
        result_cached = cache.get(cache_id)
        if result_cached != None:
            if not nested:
                addUserspecificData(result_cached, user)
            return result_cached

        result = {
            'id': self.id,
            'course': self.course.toJson(nested=True),
            'lecture': self.lecture.toJson(nested=True),
            'content': self.content if (not self.is_deleted) else '관리자에 의해 삭제된 코멘트입니다.',
            'like': self.like,
            'is_deleted': self.is_deleted,
            'grade': self.grade,
            'load': self.load,
            'speech': self.speech,
        }

        if nested:
            cache.set(cache_id, result, 60 * 5)
            return result

        cache.set(cache_id, result, 60 * 5)

        addUserspecificData(result, user)

        return result
    
    def get_score_related_list(self):
        course = self.course
        lecture = self.lecture
        professors = lecture.professors.all()
        lectures = Lecture.objects.filter(course=course, professors__in=professors)
        related_list = [course]+list(lectures)+list(professors)
        return related_list

    def recalc_like(self):
        self.like = self.votes.all().count()
        self.save()

    # Keep synchronozed with React src/common/scoreFunctions.js calcAverage()
    @classmethod
    def calc_average(cls, reviews):
        nonzero_reviews = reviews.exclude(grade=0, load=0, speech=0)
        review_num = reviews.count()
        total_weight = sum((r.like+1) for r in nonzero_reviews)
        grade_sum = sum((r.like+1)*r.grade*3 for r in nonzero_reviews)
        load_sum = sum((r.like+1)*r.load*3 for r in nonzero_reviews)
        speech_sum = sum((r.like+1)*r.speech*3 for r in nonzero_reviews)
        grade = (grade_sum + 0.0) / total_weight if (total_weight != 0) else 0.0
        load = (load_sum + 0.0) / total_weight if (total_weight != 0) else 0.0
        speech = (speech_sum + 0.0) / total_weight if (total_weight != 0) else 0.0
        return (review_num, total_weight, (grade_sum, load_sum, speech_sum), (grade, load, speech))

    def __unicode__(self):
        return u"%s(%s)"%(self.lecture,self.writer)


class ReviewVote(models.Model):
    review = models.ForeignKey(Review, related_name="votes", on_delete=models.CASCADE, null=False)
    userprofile = models.ForeignKey(UserProfile, related_name="review_votes", on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = (("review", "userprofile",))


class MajorBestReview(models.Model):
    review = models.OneToOneField(Review, related_name="major_best_review", on_delete=models.CASCADE, null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.review.lecture,self.review.writer)


class HumanityBestReview(models.Model):
    review = models.OneToOneField(Review, related_name="humanity_best_review", on_delete=models.CASCADE, null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.review.lecture,self.review.writer)


