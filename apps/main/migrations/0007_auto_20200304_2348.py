# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-03-04 14:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_auto_20200106_0145'),
    ]

    operations = [
        migrations.AddField(
            model_name='famoushumanityreviewdailyfeed',
            name='visible',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='famousmajorreviewdailyfeed',
            name='visible',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='relatedcoursedailyuserfeed',
            name='visible',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reviewwritedailyuserfeed',
            name='visible',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]
