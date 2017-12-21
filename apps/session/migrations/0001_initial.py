# -*- coding: utf-8 -*-
from __future__ import unicode_literals

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
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=255, null=True)),
                ('student_id', models.CharField(db_index=True, max_length=10)),
                ('sid', models.CharField(max_length=30)),
                ('language', models.CharField(max_length=15)),
                ('portal_check', models.IntegerField(default=0)),
                ('google_calendar_id', models.TextField(blank=True, null=True)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='subject.Department')),
                ('favorite_departments', models.ManyToManyField(related_name='favoredby_set', to='subject.Department')),
                ('take_lecture_list', models.ManyToManyField(blank=True, related_name='take_lecture_list', to='subject.Lecture')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
