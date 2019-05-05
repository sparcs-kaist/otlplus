from django.db import models

from apps.session.models import UserProfile
from apps.subject.models import Lecture

# Create your models here.

class RandomCourseReco(models.Model):
    userprofile = models.ForeignKey(UserProfile, related_name="random_course_reco", on_delete=models.SET_NULL, null=True)
    reco_date = models.DateField()
    lecture = models.ForeignKey(Lecture, db_index=True)

    def __unicode__(self):
        return u"User: %s, RecoDate: %s, Lecture: %s" % (self.userprofile, self.reco_date, self.lecture)
