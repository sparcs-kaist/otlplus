# Generated by Django 2.2.28 on 2023-03-29 17:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subject', '0023_auto_20211124_1722'),
        ('graduation', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='additionaltrack',
            unique_together={('end_year', 'type', 'department'), ('start_year', 'type', 'department')},
        ),
        migrations.AlterUniqueTogether(
            name='generaltrack',
            unique_together={('end_year', 'is_foreign'), ('start_year', 'is_foreign')},
        ),
        migrations.AlterUniqueTogether(
            name='majortrack',
            unique_together={('start_year', 'department'), ('end_year', 'department')},
        ),
    ]
