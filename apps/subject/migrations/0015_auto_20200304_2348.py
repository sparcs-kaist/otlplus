# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2020-03-04 14:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0014_remove_course_code_num'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coursefiltered',
            name='courses',
        ),
        migrations.DeleteModel(
            name='CourseFiltered',
        ),
    ]
