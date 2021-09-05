from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.session.models import UserProfile


class Notice(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    title = models.CharField(max_length=100)
    content = models.TextField()

    def toJson(self):
        result = {
            "start_time": self.start_time,
            "end_time": self.end_time,
            "title": self.title,
            "content": self.content,
        }
        return result


class Rate(models.Model):
    score = models.SmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    user = models.ForeignKey(UserProfile, related_name="rates", on_delete=models.CASCADE)
    year = models.SmallIntegerField()
    version = models.CharField(max_length=20)
    created_datetime = models.DateTimeField(auto_now_add=True, db_index=True, null=True)

    class Meta:
        unique_together = (
            "user",
            "year",
        )
