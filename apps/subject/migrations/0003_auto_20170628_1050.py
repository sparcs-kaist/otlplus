# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-06-28 01:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0002_auto_20170327_1659'),
    ]

    operations = [
        migrations.AlterField(
            model_name='classtime',
            name='roomNum',
            field=models.CharField(max_length=10, null=True),
        ),
    ]
