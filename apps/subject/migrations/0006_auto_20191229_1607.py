# -*- coding: utf-8 -*-
# Generated by Django 1.11.21 on 2019-12-29 07:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0005_auto_20190505_2314'),
    ]

    operations = [
        migrations.CreateModel(
            name='Semester',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(db_index=True)),
                ('semester', models.IntegerField(db_index=True)),
                ('beginning', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('courseRegistrationPeriodStart', models.DateTimeField(null=True)),
                ('courseRegistrationPeriodEnd', models.DateTimeField(null=True)),
                ('courseAddDropPeriodEnd', models.DateTimeField(null=True)),
                ('courseDropDeadline', models.DateTimeField(null=True)),
                ('courseEvaluationDeadline', models.DateTimeField(null=True)),
                ('gradePosting', models.DateTimeField(null=True)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='semester',
            unique_together=set([('year', 'semester')]),
        ),
    ]
