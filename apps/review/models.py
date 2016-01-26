# -*- coding: utf-8 -*-
from django.db import models
from apps.subject.models import Course, Lecture
from apps.session.models import UserProfile

class Comment(models.Model):
    course = models.ForeignKey(Course, db_index=True)
    lecture = models.ForeignKey(Lecture, db_index=True)
    
    comment = models.CharField(max_length=65536)
    grade = models.SmallIntegerField(default=-1)
    load = models.SmallIntegerField(default=-1)
    speech = models.SmallIntegerField(default=-1)
    total = models.SmallIntegerField(default=-1)

    writer = models.ForeignKey(UserProfile, related_name='comment_set', db_index=True)
    writer_label = models.CharField(max_length=200, default=u"무학과 넙죽이")
    written_datetime = models.DateTimeField(auto_now=True, db_index=True)
    like = models.IntegerField(default=0)

    def __unicode__(self):
	return u"%s(%s)"%(self.lecture,self.writer)

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


