from django.db import models

from apps.subject.models import Department


class GeneralTrack(models.Model):
    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    is_foreign = models.BooleanField(db_index=True)

    total_credit = models.IntegerField()
    total_au = models.IntegerField()
    basic_required = models.IntegerField()
    basic_elective = models.IntegerField()
    thesis_study = models.IntegerField()
    thesis_study_doublemajor = models.IntegerField()
    general_required_credit = models.IntegerField()
    general_required_au = models.IntegerField()
    humanities = models.IntegerField()
    humanities_doublemajor = models.IntegerField()


class MajorTrack(models.Model):
    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    department = models.ForeignKey(Department,
                                   on_delete=models.CASCADE, db_index=True)

    basic_elective_doublemajor = models.IntegerField()
    major_required = models.IntegerField()
    major_elective = models.IntegerField()


class AdditionalTrack(models.Model):
    ADDITIONAL_TYPE_CHOICES = [
        ('DOUBLE', 'DOUBLE'),
        ('MINOR', 'MINOR'),
        ('ADVANCED', 'ADVANCED'),
        ('INTERDISCIPLINARY', 'INTERDISCIPLINARY'),
    ]

    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    type = models.CharField(db_index=True, max_length=32, choices=ADDITIONAL_TYPE_CHOICES)
    department = models.ForeignKey(Department,
                                   null=True, blank=True,
                                   on_delete=models.CASCADE, db_index=True)

    major_required = models.IntegerField()
    major_elective = models.IntegerField()
