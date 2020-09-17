# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-09-13 10:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0017_remove_review_total'),
    ]

    operations = [
        migrations.AlterField(
            model_name='humanitybestreview',
            name='review',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='humanity_best_review', serialize=False, to='review.Review'),
        ),
    ]