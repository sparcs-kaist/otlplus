# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-01-07 19:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0009_auto_20200107_0136'),
    ]

    operations = [
        migrations.AlterField(
            model_name='semester',
            name='courseDesciptionSubmission',
            field=models.DateTimeField(null=True),
        ),
    ]
