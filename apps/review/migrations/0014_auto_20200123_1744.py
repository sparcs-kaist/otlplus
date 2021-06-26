# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-01-23 08:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0013_auto_20200123_1718'),
    ]

    operations = [
        migrations.AlterField(
            model_name='humanitybestreview',
            name='review',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='liberal_best_review', serialize=False, to='review.Review'),
        ),
        migrations.AlterField(
            model_name='majorbestreview',
            name='review',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='major_best_review', serialize=False, to='review.Review'),
        ),
    ]
