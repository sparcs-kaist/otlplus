from django.contrib import admin
from .models import *


# Register your models here.
class LectureAdmin(admin.ModelAdmin):
    raw_id_fields = 'course',


class ExamTimeAdmin(admin.ModelAdmin):
    list_display = ('lecture', 'day', 'begin', 'end')
    ordering = ('lecture',)


class ClassTimeAdmin(admin.ModelAdmin):
    list_display = ('lecture', 'day', 'begin', 'end', 'room_name', 'building_full_name', 'building_full_name_en')
    ordering = ('lecture',)


admin.site.register(Lecture, LectureAdmin)
admin.site.register(Department)
admin.site.register(Course)
admin.site.register(Professor)
# admin.site.register(ExamTime,ExamTimeAdmin)
# admin.site.register(ClassTime,ClassTimeAdmin)
