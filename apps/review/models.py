# -*- coding: utf-8 -*-
from django.db import models
from apps.subject.models import Course, Lecture, Professor
from apps.session.models import UserProfile

class Comment(models.Model):
    course = models.ForeignKey(Course, db_index=True)
    lecture = models.ForeignKey(Lecture, db_index=True)
    
    comment = models.CharField(max_length=65536)
    grade = models.SmallIntegerField(default=0)
    load = models.SmallIntegerField(default=0)
    speech = models.SmallIntegerField(default=0)
    total = models.FloatField(default=0.0)

    writer = models.ForeignKey(UserProfile, related_name='comment_set', db_index=True)
    writer_label = models.CharField(max_length=200, default=u"무학과 넙죽이")
    written_datetime = models.DateTimeField(auto_now=True, db_index=True)
    like = models.IntegerField(default=0)

    def __unicode__(self):
	return u"%s(%s)"%(self.lecture,self.writer)
    
    @classmethod
    def u_create(cls, course, lecture, comment, grade, load, speech, writer):
        professors = lecture.professor.all()
        related_list = [course]+[lecture]+list(professors)
        for related in related_list:
            related.grade_sum += grade*3
            related.load_sum += load*3
            related.speech_sum += speech*3
            related.comment_num += 1
            related.avg_update()
            related.save()
        new = cls(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, total=(grade+load+speech)/3.0, writer=writer)
        new.save()
        return new

    def u_update(self, comment, grade, load, speech):
        course = self.course
        lecture = self.lecture
        professors = lecture.professor.all()
        related_list = [course]+[lecture]+list(professors)
        for related in related_list:
            related.grade_sum += (grade - self.grade)*3
            related.load_sum += (load - self.load)*3
            related.speech_sum += (speech - self.speech)*3
            related.avg_update()
            related.save()
        self.comment = comment
        self.grade = grade
        self.load = load
        self.speech = speech
        self.total = (grade+load+speech)/3.0
        self.save()

    def u_delete(self):
        course = self.course
        lecture = self.lecture
        professors = lecture.professor.all()
        related_list = [course]+[lecture]+list(professors)
        for related in related_list:
            related.grade_sum -= self.grade*3
            related.load_sum -= self.load*3
            related.speech_sum -= self.speech*3
            related.comment_num -= 1
            related.avg_update()
            related.save()
        self.delete()
   

        

class CommentVote(models.Model):
    comment = models.ForeignKey(Comment, related_name="comment_vote", null=False)
    userprofile = models.ForeignKey(UserProfile, related_name="comment_vote")
    is_up = models.BooleanField(null=False)

class MajorBestComment(models.Model):
    comment = models.OneToOneField(Comment, related_name="major_best_comment", null=False, primary_key=True)
    def __unicode__(self):
	return u"%s(%s)"%(self.comment.lecture,self.comment.writer)

class LiberalBestComment(models.Model):
    comment = models.OneToOneField(Comment, related_name="liberal_best_comment", null=False, primary_key=True)
    def __unicode__(self):
	return u"%s(%s)"%(self.comment.lecture,self.comment.writer)


