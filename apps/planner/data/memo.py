
# class RecognizedCourse(models.Model):
#     original_course = models.ForeignKey(Course, related_name="recognized_course_original_course", on_delete=models.PROTECT)
#     recognized_course = models.ForeignKey(Course, related_name="recognized_course_recognized_course", on_delete=models.PROTECT)


# class BasicGraduationRequirement(models.Model):
#     entrance_from = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
#     entrance_to = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
#     total_credit = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(999)])
#     mandatory_basic = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     mandatory_general = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     mandatory_general_au = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     elective_hss = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     research = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])


# class MajorGraduationRequirement(models.Model):
#     MAJOR = "MAJOR"
#     DOUBLE_MAJOR = "DOUBLE_MAJOR"
#     MINOR = "MINOR"
#     SPECIALIZED_MAJOR = "SPECIALIZED_MAJOR"
#     SELF_DESIGNED_MAJOR = "SELF_DESIGNED_MAJOR"
#     MajorType = [
#         (MAJOR, "major"),                               # 주전공
#         (DOUBLE_MAJOR, "double_major"),                 # 복수전공
#         (MINOR, "minor"),                               # 부전공
#         (SPECIALIZED_MAJOR, "specialized_major"),       # 심화전공
#         (SELF_DESIGNED_MAJOR, "self_designed_major")    # 융합전공
#     ]
    
#     department = models.ForeignKey(Department, on_delete=models.PROTECT)
#     entrance_from = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
#     entrance_to = models.IntegerField(validators=[MinValueValidator(1900), MaxValueValidator(9999)])
#     major_type = models.CharField(choices=MajorType, max_length=30)
#     mandatory_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     elective_major = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     elective_basic = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(200)])
#     recognized_courses = models.ManyToManyField(RecognizedCourse, related_name="recognized_course_user_set")


# class RequiredCourseSet(models.Model):
#     MAJOR_REQUIRED = "MAJOR_REQUIRED"
#     MAJOR_ELECTIVE = "MAJOR_ELECTIVE"
#     BASIC_ELECTIVE = "BASIC_ELECTIVE"
#     RequiredCourseType = [
#         (MAJOR_REQUIRED, "major_required"),     # 전필 필수과목
#         (MAJOR_ELECTIVE, "major_elective"),     # 전선 필수과목
#         (BASIC_ELECTIVE, "basic_elective")      # 기선 필수과목
#     ]
        
#     graduation_requirement = models.ForeignKey(MajorGraduationRequirement, on_delete=models.PROTECT)
#     course = models.ManyToManyField(Course)
#     min_credit = models.IntegerField(default=0)
#     type = models.CharField(choices=RequiredCourseType, max_length=20)

