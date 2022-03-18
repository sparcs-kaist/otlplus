from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from apps.session.models import UserProfile
from apps.subject.models import Department, Course


class RecognizedCourse(models.Model):
    original_course = models.ForeignKey(Course, related_name="recognized_course_original_course")
    recognized_course = models.ForeignKey(Course, related_name="recognized_course_recognized_course")


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
        SELF_DESIGNED_MAJOR = "self_designed_major" # 융합전공
    
    department = models.ForeignKey(Department)
    entrance_from = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    entrance_to = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
    major_type = models.CharField(choices=MajorType.choices)
    mandatory_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    elective_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    elective_basic = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
    recognized_courses = models.ManyToManyField(RecognizedCourse, related_name="recognized_course_user_set")


class RequiredCourseSet(models.Model):
    class RequiredCourseType(models.TextChoices):
        MAJOR_REQUIRED  = "major_required"      # 전필 필수과목
        MAJOR_ELECTIVE = "major_elective"       # 전선 필수과목
        BASIC_ELECTIVE = "basic_elective"       # 기선 필수과목
        
    graduation_requirement = models.ForeignKey(MajorGraduationRequirement)
    course = models.ForeignKey(Course, related_name="required_course_set_course")
    type = models.CharField(choices=RequiredCourseType.choices)


class Planner(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, db_index=True)
    entrance_year = models.IntegerField(db_index=True)

    basic_graduation_requirement = models.ForeignKey(BasicGraduationRequirement, on_delete=models.PROTECT, db_index=True)
    major_graduation_requirements = models.ManyToManyField(MajorGraduationRequirement, related_name="graduation_requirement_user_set")


class PlannerItem(models.Model):
    planner = models.ForeignKey(Planner, on_delete=models.PROTECT, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.IntegerField(db_index=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT, db_index=True)
