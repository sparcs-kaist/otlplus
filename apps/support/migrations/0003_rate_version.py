# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2021-01-12 20:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0002_auto_20210113_0103'),
    ]

    operations = [
        migrations.AddField(
            model_name='rate',
            name='version',
            field=models.CharField(default='3.2.1.0', max_length=20),
            preserve_default=False,
        ),
    ]
