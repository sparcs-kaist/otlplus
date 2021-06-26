# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-05-05 14:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0004_auto_20180301_2046'),
        ('subject', '0004_auto_20181108_2054'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latest_read_datetime', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='course',
            name='latest_written_datetime',
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AddField(
            model_name='courseuser',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='subject.Course'),
        ),
        migrations.AddField(
            model_name='courseuser',
            name='user_profile',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='session.UserProfile'),
        ),
    ]
