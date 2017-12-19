# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-12-19 15:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0009_auto_20170905_1501'),
        ('timetable', '0003_auto_20170627_2342'),
    ]

    operations = [
        migrations.CreateModel(
            name='OldTimeTable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('student_id', models.CharField(max_length=10)),
                ('year', models.IntegerField(null=True)),
                ('semester', models.SmallIntegerField(null=True)),
                ('table_no', models.SmallIntegerField(null=True)),
                ('lecture', models.ManyToManyField(to='subject.Lecture')),
            ],
        ),
    ]
