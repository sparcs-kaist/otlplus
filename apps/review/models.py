# -*- coding: utf-8 -*-
from django.db import models
from django.core.cache import cache
from apps.subject.models import Course, Lecture, Professor
from apps.session.models import UserProfile


class Review(models.Model):
    course = models.ForeignKey(Course, db_index=True, related_name='reviews')
    lecture = models.ForeignKey(Lecture, db_index=True, related_name='reviews')

    comment = models.CharField(max_length=65536)
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

    def toJson(self, nested=False, user=None):
        def addUserspecificData(result, user):
            is_liked = True
            if (not user) or (not user.is_authenticated()):
                is_liked = False
            else:
                is_liked = ReviewVote.objects.filter(comment = self, userprofile__user = user).exists()
            result.update({
                'userspecific_is_liked': is_liked,
            })

        cache_id = "review:%d:%s" % (self.id, 'nested' if nested else 'normal')
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
            'comment': self.comment if (not self.is_deleted) else '관리자에 의해 삭제된 코멘트입니다.',
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
        self.like = self.comment_vote.all().count()
        cache.delete("review:%d:nested" % self.id)
        cache.delete("review:%d:normal" % self.id)
        self.save()

    def __unicode__(self):
        return u"%s(%s)"%(self.lecture,self.writer)

    def alphabet_score(self):
        d = ['?', 'F', 'D', 'C', 'B', 'A']
        return (d[self.grade], d[self.load], d[self.speech], d[int(round(self.total))])

    @classmethod
    def u_create(cls, course, lecture, comment, grade, load, speech, writer):
        professors = lecture.professors.all()
        lectures = Lecture.objects.filter(course=course, professors__in=professors)
        related_list = [course]+list(lectures)+list(professors)
        for related in related_list:
            related.grade_sum += grade*3
            related.load_sum += load*3
            related.speech_sum += speech*3
            related.comment_num += 1
            related.avg_update()
            related.save()
        new = cls(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, total=(grade+load+speech)/3.0, writer=writer)
        new.save()
        course.latest_written_datetime = new.written_datetime
        course.save()
        return new

    def u_update(self, comment, grade, load, speech):
        course = self.course
        lecture = self.lecture
        professors = lecture.professors.all()
        lectures = Lecture.objects.filter(course=course, professors__in=professors)
        related_list = [course]+list(lectures)+list(professors)
        for related in related_list:
            related.grade_sum += (self.like+1)*(grade - self.grade)*3
            related.load_sum += (self.like+1)*(load - self.load)*3
            related.speech_sum += (self.like+1)*(speech - self.speech)*3
            related.avg_update()
            related.save()
        self.comment = comment
        self.grade = grade
        self.load = load
        self.speech = speech
        self.total = (grade+load+speech)/3.0
        self.save()
        cache.delete("review:%d:nested" % self.id)
        cache.delete("review:%d:normal" % self.id)
        course.save()

    def u_delete(self):
        course = self.course
        lecture = self.lecture
        professors = lecture.professors.all()
        lectures = Lecture.objects.filter(course=course, professors__in=professors)
        related_list = [course]+list(lectures)+list(professors)
        for related in related_list:
            related.grade_sum -= (self.like+1)*self.grade*3
            related.load_sum -= (self.like+1)*self.load*3
            related.speech_sum -= (self.like+1)*self.speech*3
            related.comment_num -= (self.like+1)
            related.avg_update()
            related.save()
        self.delete()


class ReviewVote(models.Model):
    comment = models.ForeignKey(Review, related_name="comment_vote", null=False)
    userprofile = models.ForeignKey(UserProfile, related_name="comment_vote", on_delete=models.SET_NULL, null=True)
    is_up = models.BooleanField(null=False)

    class Meta:
        unique_together = (("comment", "userprofile",))

    @classmethod
    def cv_create(cls, comment, userprofile):
        professors = comment.lecture.professors.all()
        lectures = Lecture.objects.filter(course=comment.course, professors__in=professors)
        related_list = [comment.course]+list(lectures)+list(professors)
        if comment.grade > 0 and comment.load > 0 and comment.speech > 0 :
            for related in related_list:
                related.grade_sum += comment.grade*3
                related.load_sum += comment.load*3
                related.speech_sum += comment.speech*3
                related.comment_num += 1
                related.avg_update()
                related.save()
        comment.like +=1
        comment.save()
        new = cls(userprofile=userprofile, comment=comment, is_up = True)
        new.save()
        return new


class MajorBestReview(models.Model):
    comment = models.OneToOneField(Review, related_name="major_best_comment", null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.comment.lecture,self.comment.writer)


class HumanityBestReview(models.Model):
    comment = models.OneToOneField(Review, related_name="liberal_best_comment", null=False, primary_key=True)

    def __unicode__(self):
        return u"%s(%s)"%(self.comment.lecture,self.comment.writer)


