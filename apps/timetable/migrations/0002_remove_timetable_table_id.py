# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2018-03-04 11:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='timetable',
            name='table_id',
        ),
    ]
