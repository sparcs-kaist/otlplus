from django.db import models

class Lecture(models.Model):
    code = models.CharField(max_length=10,db_index=True)
    old_code = models.CharField(max_length=10, db_index=True)
    year = models.IntegerField(db_index=True)
    semester = models.SmallIntegerField(db_index=True)
    department = models.ForeignKey('Department') 
    class_no = models.CharField(max_length=4, blank=True)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    audience = models.IntegerField()
    credit = models.IntegerField(default=3)
    num_classes = models.IntegerField(default=3)
    num_labs = models.IntegerField(default=0)
    credit_au = models.IntegerField(default=0)
    limit = models.IntegerField(default=0)
    num_people = models.IntegerField(default=0, blank=True, null=True)
    professor = models.ManyToManyField('Professor', related_name='lecture_professor', blank=True)
    is_english = models.BooleanField()
    deleted = models.BooleanField(default=False)

    course = models.ForeignKey('Course', related_name='lecture_course')

    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.IntegerField(default=0)
 
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    comment_num = models.IntegerField(default=0)

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0

    def __unicode__(self):
        professors_list=self.professor.all()
        re_str=u"%s(%s %s"%(self.title,self.old_code,professors_list[0].professor_name)
        for i in range(1,len(professors_list)):
            re_str+=", %s"%(professors_list[i].professor_name)
        re_str+=")"
        return re_str

class Department(models.Model):
    id = models.IntegerField(primary_key=True, db_index=True)
    num_id = models.CharField(max_length=4, db_index=True)
    code = models.CharField(max_length=5, db_index=True)
    name = models.CharField(max_length=60, db_index=True)
    name_en = models.CharField(max_length=60, null=True, db_index=True)
    visible = models.BooleanField(default=True)

    def __unicode__(self):
        return self.code

class Course(models.Model):
    old_code = models.CharField(max_length=10, db_index=True)
    code_num = models.CharField(max_length=10, db_index=True, default = 'D')
    department = models.ForeignKey('Department', db_index=True)
    professors = models.ManyToManyField('Professor', db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)
    
    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.IntegerField(default=0)
    comment_num = models.IntegerField(default=0)

    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0

    def __unicode__(self):
        return u"%s(%s)"%(self.title,self.old_code)
    
class Professor(models.Model):
    professor_name = models.CharField(max_length=100, db_index=True)
    professor_name_en = models.CharField(max_length=100, blank=True, null=True)
    professor_id = models.IntegerField()
    major = models.CharField(max_length=30)
    course_list = models.ManyToManyField('Course', db_index=True)

    grade_sum = models.IntegerField(default=0)
    load_sum = models.IntegerField(default=0)
    speech_sum = models.IntegerField(default=0)
    total_sum = models.IntegerField(default=0)
    comment_num = models.IntegerField(default=0)

    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)
    total = models.FloatField(default=0.0)

    def avg_update(self):
        self.total_sum = (self.grade_sum+self.load_sum+self.speech_sum)/3.0
        if self.comment_num>0:
            self.grade = (self.grade_sum + 0.0)/self.comment_num
            self.load = (self.load_sum + 0.0)/self.comment_num
            self.speech = (self.speech_sum + 0.0)/self.comment_num
            self.total = (self.total_sum + 0.0)/self.comment_num
        else:
            self.grade = 0.0
            self.load = 0.0
            self.speech = 0.0
            self.total = 0.0
    
    def __unicode__(self):
	    return u"%s(id:%d)"%(self.professor_name,self.professor_id)

class CourseFiltered(models.Model):
    title = models.CharField(max_length=100, default="", db_index=True, unique=True)
    courses = models.ManyToManyField('Course', db_index=True)
    def __unicode__(self):
        return self.title
