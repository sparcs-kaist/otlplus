# -*- coding: utf-8 -*-

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('subject', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('student_id', models.CharField(max_length=10, db_index=True)),
                ('sid', models.CharField(max_length=30)),
                ('language', models.CharField(max_length=15)),
                ('portal_check', models.IntegerField(default=0)),
                ('favorite_departments', models.ManyToManyField(related_name='favoredby_set', to='subject.Department')),
                ('take_lecture_list', models.ManyToManyField(related_name='take_lecture_list', to='subject.Lecture', blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)),
            ],
        ),
    ]
