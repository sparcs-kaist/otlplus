# Generated by Django 2.2.24 on 2022-10-10 20:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='self_designed',
            field=models.BooleanField(default=False),
        ),
    ]