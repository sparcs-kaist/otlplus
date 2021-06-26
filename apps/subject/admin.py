from django.contrib import admin

from apps.subject.models import Course, Department, Lecture, Professor


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    raw_id_fields = ("course",)


# @admin.register(ExamTime)
class ExamTimeAdmin(admin.ModelAdmin):
    list_display = ("lecture", "day", "begin", "end")
    ordering = ("lecture",)


# @admin.register(ClassTime)
class ClassTimeAdmin(admin.ModelAdmin):
    list_display = ("lecture", "day", "begin", "end", "room_name", "building_full_name", "building_full_name_en")
    ordering = ("lecture",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    pass


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    pass


@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
    pass
