# Generated by Django 2.2.24 on 2021-09-10 21:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0008_auto_20200913_1916'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='google_calendar_id',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='google_credential',
        ),
    ]