# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-07-04 11:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0005_auto_20200113_1601'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='subject.Department'),
        ),
    ]
