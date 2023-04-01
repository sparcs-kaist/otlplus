# Generated by Django 2.2.28 on 2023-04-01 06:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0023_auto_20211124_1722'),
        ('planner', '0012_auto_20230330_2112'),
    ]

    operations = [
        migrations.AddField(
            model_name='arbitraryplanneritem',
            name='credit',
            field=models.IntegerField(default=3),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='arbitraryplanneritem',
            name='credit_au',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='arbitraryplanneritem',
            name='department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='subject.Department'),
        ),
        migrations.AddField(
            model_name='arbitraryplanneritem',
            name='type',
            field=models.CharField(default='인문사회선택', max_length=12),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='arbitraryplanneritem',
            name='type_en',
            field=models.CharField(default='Humanities & Social Elective', max_length=36),
            preserve_default=False,
        ),
    ]
