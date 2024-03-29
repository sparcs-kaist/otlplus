# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2021-01-12 16:03

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0008_auto_20200913_1916'),
        ('support', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Rate',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.SmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('year', models.SmallIntegerField()),
                ('created_datetime', models.DateTimeField(auto_now_add=True, db_index=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rates', to='session.UserProfile')),
            ],
        ),
        migrations.AlterModelTable(
            name='notice',
            table=None,
        ),
        migrations.AlterUniqueTogether(
            name='rate',
            unique_together=set([('user', 'year')]),
        ),
    ]
