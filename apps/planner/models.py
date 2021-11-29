from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from apps.subject.models import Department, Course

class BasicGraduationRequirement(models.Model):
    entrance_from = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    entrance_to = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    total_credit = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(999)])
    mandatory_basic = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    mandatory_general = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    mandatory_general_au = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    elective_hss = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    research = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])


class MajorGraduationRequirement(models.Model):
    class MajorType(models.TextChoices):
        MAJOR = "major"                             # 주전공
        DOUBLE_MAJOR = "double_major"               # 복수전공
        MINOR = "minor"                             # 부전공
        SPECIALIZED_MAJOR = "specialized_major"     # 심화전공
        SELF_DESIGNED_MAJRO = "self_designed_major" # 융합전공
    
    department = models.ForeignKey(Department)
    entrance_from = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    entrance_to = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    major_type = models.CharField(choices=MajorType.choices)
    mandatory_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    elective_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    elective_basic = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])


class RecognizedCourse(models.Model):
    original_course = models.ForeignKey(Course, related_name="recognized_course_original_course")
    recognized_course = models.ForeignKey(Course, related_name="recognized_course_recognized_course")
