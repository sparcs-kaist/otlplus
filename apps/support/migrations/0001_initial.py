# -*- coding: utf-8 -*-
# Generated by Django 1.11.28 on 2020-10-08 14:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('main', '0011_auto_20201008_2300'),
    ]

    state_operations = [
        migrations.CreateModel(
            name='Notice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('title', models.CharField(max_length=100)),
                ('content', models.TextField()),
            ],
            options={
                'db_table': 'support_notice',
            }
        ),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(state_operations=state_operations)
    ]
