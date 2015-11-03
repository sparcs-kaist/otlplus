# -*- coding: utf-8
from django.db import models
from django.contrib.auth.models import User
from apps.subject.models import Department, Lecture

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    student_id = models.CharField(max_length=10)
    language = models.CharField(max_length=15)
    favorite_departments = models.ManyToManyField('subject.Department', related_name='favoredby_set')
    take_lecture_list = models.ManyToManyField('subject.Lecture', related_name='take_lecture_list', blank=True)
    
    def __unicode__(self):
        return u'%s %s' % (self.user.username, self.student_id)

