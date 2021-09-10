from django.conf import settings
from django.contrib.auth.models import User
from django.db import models

from .sparcsssov2 import Client
from apps.subject.models import Department, Lecture

sso_client = Client(settings.SSO_CLIENT_ID, settings.SSO_SECRET_KEY, is_beta=settings.SSO_IS_BETA)


class UserProfile(models.Model):

    user = models.OneToOneField(User, related_name="userprofile", on_delete=models.CASCADE, db_index=True)

    department = models.ForeignKey(Department, on_delete=models.SET_NULL, blank=True, null=True)
    majors = models.ManyToManyField(Department, related_name="major_user_set")  # 복수전공들 index 0가
    minors = models.ManyToManyField(Department, related_name="minor_user_set")  # 부전공.
    specialized_major = models.ManyToManyField(Department, related_name="specialized_major_user_set")  # 심화전공.
    email = models.EmailField(max_length=255, blank=True, null=True)  # Email

    student_id = models.CharField(max_length=10, db_index=True)
    sid = models.CharField(max_length=30)  # 서비스에 대해 고유하게 부여받은 ID
    language = models.CharField(max_length=15)
    favorite_departments = models.ManyToManyField("subject.Department", related_name="favoredby_set")
    taken_lectures = models.ManyToManyField("subject.Lecture", related_name="taken_users", blank=True)
    portal_check = models.IntegerField(default=0)
    point = 0
    point_updated_time = None

    def get_point(self):
        self.point = sso_client.get_point(self.sid)
        return self.point

    def add_point(self, delta, message):
        result = sso_client.modify_point(self.sid, delta, message, 0)
        return result

    @property
    def review_writable_lectures(self):
        return self.taken_lectures.filter(Lecture.getQueryReviewWritable())

    def __str__(self):
        return "%s %s" % (self.user.username, self.student_id)
