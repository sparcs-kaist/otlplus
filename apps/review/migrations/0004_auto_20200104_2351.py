# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-01-04 14:51
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0003_auto_20181228_1757'),
    ]

    operations = [
        migrations.RenameField(
            model_name='comment',
            old_name='written_datetime',
            new_name='updated_datetime',
        ),
    ]