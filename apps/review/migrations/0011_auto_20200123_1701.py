# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-01-23 08:01
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0005_auto_20200113_1601'),
        ('review', '0010_auto_20200123_1653'),
    ]

    operations = [
        migrations.RenameField(
            model_name='reviewvote',
            old_name='comment',
            new_name='review',
        ),
        migrations.AlterUniqueTogether(
            name='reviewvote',
            unique_together=set([('review', 'userprofile')]),
        ),
    ]
