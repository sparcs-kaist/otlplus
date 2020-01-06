# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-01-05 16:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0006_auto_20200104_2357'),
        ('main', '0005_auto_20200106_0126'),
    ]

    operations = [
        migrations.CreateModel(
            name='FamousHumanityReviewDailyFeed',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('priority', models.FloatField()),
                ('reviews', models.ManyToManyField(to='review.Comment')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='famoushumanityreviewdailyfeed',
            unique_together=set([('date',)]),
        ),
    ]