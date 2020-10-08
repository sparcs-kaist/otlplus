# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.


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
