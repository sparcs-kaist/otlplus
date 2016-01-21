from django.contrib import admin
from apps.subject.models import *
# Register your models here.
class LectureAdmin(admin.ModelAdmin):
    raw_id_fields = 'course',
 
admin.site.register(Lecture, LectureAdmin)
admin.site.register(Department)
admin.site.register(Course)
admin.site.register(Professor)
