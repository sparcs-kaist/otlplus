# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-09-13 10:16
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0006_auto_20200704_2014'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='take_lecture_list',
            new_name='taken_lectures',
        ),
    ]
