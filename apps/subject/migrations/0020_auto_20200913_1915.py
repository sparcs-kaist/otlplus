# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-09-13 10:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0019_auto_20200913_1859'),
    ]

    operations = [
        migrations.AlterField(
            model_name='classtime',
            name='lecture',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='classtimes', to='subject.Lecture'),
        ),
        migrations.AlterField(
            model_name='examtime',
            name='lecture',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='examtimes', to='subject.Lecture'),
        ),
        migrations.AlterField(
            model_name='lecture',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='lectures', to='subject.Course'),
        ),
        migrations.AlterField(
            model_name='lecture',
            name='professors',
            field=models.ManyToManyField(blank=True, db_index=True, related_name='lectures', to='subject.Professor'),
        ),
    ]