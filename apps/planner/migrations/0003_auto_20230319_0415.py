# Generated by Django 2.2.28 on 2023-03-18 19:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0023_auto_20211124_1722'),
        ('session', '0009_auto_20210911_0624'),
        ('planner', '0002_track_self_designed'),
    ]

    operations = [
        migrations.CreateModel(
            name='Planner',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entrance_year', models.IntegerField(db_index=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='session.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='PlannerItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(db_index=True)),
                ('semester', models.IntegerField(db_index=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='subject.Course')),
                ('planner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='planner.Planner')),
            ],
        ),
        migrations.DeleteModel(
            name='Track',
        ),
    ]