# -*- coding: utf-8 -*-
from django.db import models
from django.core.cache import cache
from apps.subject.models import Course, Lecture, Professor
from apps.session.models import UserProfile


class Review(models.Model):
    course = models.ForeignKey(Course, db_index=True, related_name='reviews')
    lecture = models.ForeignKey(Lecture, db_index=True, related_name='reviews')

    content = models.CharField(max_length=65536)
    grade = models.SmallIntegerField(default=0)
    load = models.SmallIntegerField(default=0)
    speech = models.SmallIntegerField(default=0)
    total = models.FloatField(default=0.0)

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

        letters = ['?', 'F', 'D', 'C', 'B', 'A']
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
            'grade_letter': letters[self.grade],
            'load_letter': letters[self.load],
            'speech_letter': letters[self.speech],
        }

        if nested:
            cache.set(cache_id, result, 60 * 5)
            return result

        cache.set(cache_id, result, 60 * 5)

        addUserspecificData(result, user)

        return result
    
    def recalc_like(self):
        self.like = self.votes.all().count()
        cache.delete(self.getCacheKey(True))
        cache.delete(self.getCacheKey(False))
        self.save()

    def __unicode__(self):
        return u"%s(%s)"%(self.lecture,self.writer)

    def alphabet_score(self):
        d = ['?', 'F', 'D', 'C', 'B', 'A']
        return (d[self.grade], d[self.load], d[self.speech], d[int(round(self.total))])


class ReviewVote(models.Model):
    review = models.ForeignKey(Review, related_name="votes", null=False)
    userprofile = models.ForeignKey(UserProfile, related_name="review_votes", on_delete=models.SET_NULL, null=True)
    is_up = models.BooleanField(null=False)

    class Meta:
        unique_together = (("review", "userprofile",))

    @classmethod
    def cv_create(cls, review, userprofile):
        professors = review.lecture.professors.all()
        lectures = Lecture.objects.filter(course=review.course, professors__in=professors)
        related_list = [review.course]+list(lectures)+list(professors)
        if review.grade > 0 and review.load > 0 and review.speech > 0 :
            for related in related_list:
                related.grade_sum += review.grade*3
                related.load_sum += review.load*3
                related.speech_sum += review.speech*3
                related.review_num += 1
                related.avg_update()
                related.save()
        review.like +=1
        review.save()
        new = cls(userprofile=userprofile, review=review, is_up = True)
        new.save()
        return new


class MajorBestReview(models.Model):
    review = models.OneToOneField(Review, related_name="major_best_review", null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.review.lecture,self.review.writer)


class HumanityBestReview(models.Model):
    review = models.OneToOneField(Review, related_name="liberal_best_review", null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.review.lecture,self.review.writer)


