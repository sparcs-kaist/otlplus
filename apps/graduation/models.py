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

    def to_json(self):
        result = {
            "id": self.id,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "is_foreign": self.is_foreign,
            "total_credit": self.total_credit,
            "total_au": self.total_au,
            "basic_required": self.basic_required,
            "basic_elective": self.basic_elective,
            "thesis_study": self.thesis_study,
            "thesis_study_doublemajor": self.thesis_study_doublemajor,
            "general_required_credit": self.general_required_credit,
            "general_required_au": self.general_required_au,
            "humanities": self.humanities,
            "humanities_doublemajor": self.humanities_doublemajor,
        }

        return result


class MajorTrack(models.Model):
    start_year = models.IntegerField(db_index=True)
    end_year = models.IntegerField(db_index=True)
    department = models.ForeignKey(Department,
                                   on_delete=models.CASCADE, db_index=True)

    basic_elective_doublemajor = models.IntegerField()
    major_required = models.IntegerField()
    major_elective = models.IntegerField()

    def to_json(self):
        result = {
            "id": self.id,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "department": self.department.to_json(nested=False),
            "basic_elective_doublemajor": self.basic_elective_doublemajor,
            "major_required": self.major_required,
            "major_elective": self.major_elective,
        }

        return result


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

    def to_json(self):
        result = {
            "id": self.id,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "type": self.type,
            "department": self.department.to_json(nested=False) if self.department else None,
            "major_required": self.major_required,
            "major_elective": self.major_elective,
        }

        return result
