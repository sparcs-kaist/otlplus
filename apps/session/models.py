# -*- coding: utf-8
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from apps.session.sparcssso import Client
from apps.subject.models import Department, Lecture
from apps.timetable.models import TimeTable

# TESTING #
sso_client = Client('wow client id', 'so secret key', is_beta=True)


class UserProfile(models.Model):
    user = models.ForeignKey(User)

    department = models.ForeignKey(Department)
	majors = models.ManyToManyField(Department, related_name='user_set') #복수전공들 index 0가 
	minors = models.ManyToManyField(Department) #부전공.
    specialized_major = models.ManyToManyField(Department) #심화전공.
	email = models.EmailField(max_length=255, blank=True, null=True) #Email
	
    student_id = models.CharField(max_length=10, db_index = True)
    sid = models.CharField(max_length=30) #서비스에 대해 고유하게 부여받은 ID
    language = models.CharField(max_length=15)
    favorite_departments = models.ManyToManyField('subject.Department', related_name='favoredby_set')
    take_lecture_list = models.ManyToManyField('subject.Lecture', related_name='take_lecture_list', blank=True)
    portal_check = models.IntegerField(default=0)
    point = 0
    point_updated_time = None

    def get_point(self, update=False):
        self.point = sso_client.get_point(self.sid)
        return self.point

    def add_point(self, delta, message):
        result = sso_client.modify_point(self.sid, delta, message, 0)
        # print result['point']         # 포인트
        # print result['modified']      # 변경되었는지 여부
        # print result['last_modified'] # 마지막으로 변경된 시간의 isoformat 문자열
        return result

    def __unicode__(self):
        return u'%s %s' % (self.user.username, self.student_id)


class BlockColor(models.Model):
    user = models.ForeignKey(User)
    course = models.ForeignKey('subject.Course', on_delete=models.CASCADE)
    year = models.IntegerField()
    semester = models.SmallIntegerField()
    color = models.IntegerField()
