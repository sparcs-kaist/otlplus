# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2021-08-08 08:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0021_auto_20210427_1708'),
        ('main', '0012_auto_20210113_0133'),
    ]

    operations = [
        migrations.CreateModel(
            name='RankedReviewDailyFeed',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('priority', models.FloatField()),
                ('visible', models.BooleanField()),
                ('semester', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='subject.Semester')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='rankedreviewdailyfeed',
            unique_together=set([('date',)]),
        ),
    ]
