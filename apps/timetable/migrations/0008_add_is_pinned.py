# Generated by Django 2.2.28 on 2024-02-08 08:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timetable', '0007_add_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='timetable',
            name='is_pinned',
            field=models.BooleanField(default=False),
        ),
    ]
