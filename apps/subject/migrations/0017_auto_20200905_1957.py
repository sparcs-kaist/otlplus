# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-09-05 10:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0016_auto_20200704_2014'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='total',
        ),
        migrations.RemoveField(
            model_name='course',
            name='total_sum',
        ),
        migrations.RemoveField(
            model_name='lecture',
            name='total',
        ),
        migrations.RemoveField(
            model_name='lecture',
            name='total_sum',
        ),
        migrations.RemoveField(
            model_name='professor',
            name='total',
        ),
        migrations.RemoveField(
            model_name='professor',
            name='total_sum',
        ),
    ]
