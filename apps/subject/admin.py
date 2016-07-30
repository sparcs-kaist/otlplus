from django.contrib import admin
from apps.subject.models import *
# Register your models here.
class LectureAdmin(admin.ModelAdmin):
    raw_id_fields = 'course',
class CourseFilteredAdmin(admin.ModelAdmin):
    raw_id_fields = 'courses',

class ExamTimeAdmin(admin.ModelAdmin):
	list_display = ('lecture', 'day', 'begin', 'end')
	ordering = ('lecture',)

class ClassTimeAdmin(admin.ModelAdmin):
	list_display = ('lecture', 'day', 'begin', 'end', 'roomNum', 'roomName_ko', 'roomName_en')
	ordering = ('lecture',)


admin.site.register(Lecture, LectureAdmin)
admin.site.register(Department)
admin.site.register(Course)
admin.site.register(Professor)
admin.site.register(CourseFiltered,CourseFilteredAdmin)
admin.site.register(ExamTime,ExamTimeAdmin)
admin.site.register(ClassTime,ClassTimeAdmin)
