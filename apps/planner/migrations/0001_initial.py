# Generated by Django 2.2.28 on 2023-04-11 09:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('subject', '0023_auto_20211124_1722'),
        ('graduation', '0002_auto_20230330_0205'),
        ('session', '0009_auto_20210911_0624'),
    ]

    operations = [
        migrations.CreateModel(
            name='Planner',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_year', models.IntegerField(db_index=True)),
                ('end_year', models.IntegerField(db_index=True)),
                ('arrange_order', models.SmallIntegerField(db_index=True)),
                ('additional_tracks', models.ManyToManyField(to='graduation.AdditionalTrack')),
                ('general_track', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='graduation.GeneralTrack')),
                ('major_track', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='graduation.MajorTrack')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='planners', to='session.UserProfile')),
            ],
        ),
        migrations.CreateModel(
            name='FuturePlannerItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_excluded', models.BooleanField(default=False)),
                ('year', models.IntegerField(db_index=True)),
                ('semester', models.IntegerField(db_index=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='subject.Course')),
                ('planner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='future_items', to='planner.Planner')),
            ],
        ),
        migrations.CreateModel(
            name='ArbitraryPlannerItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_excluded', models.BooleanField(default=False)),
                ('year', models.IntegerField(db_index=True)),
                ('semester', models.IntegerField(db_index=True)),
                ('type', models.CharField(max_length=12)),
                ('type_en', models.CharField(max_length=36)),
                ('credit', models.IntegerField()),
                ('credit_au', models.IntegerField()),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='subject.Department')),
                ('planner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='arbitrary_items', to='planner.Planner')),
            ],
        ),
        migrations.CreateModel(
            name='TakenPlannerItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_excluded', models.BooleanField(default=False)),
                ('lecture', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='subject.Lecture')),
                ('planner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='taken_items', to='planner.Planner')),
            ],
            options={
                'unique_together': {('planner', 'lecture')},
            },
        ),
    ]
