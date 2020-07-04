# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-07-04 11:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0015_auto_20200304_2348'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='subject.Department'),
        ),
        migrations.AlterField(
            model_name='lecture',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='lecture_course', to='subject.Course'),
        ),
        migrations.AlterField(
            model_name='lecture',
            name='department',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='subject.Department'),
        ),
    ]
