from django.contrib import admin
from apps.timetable.models import TimeTable


class TimeTableAdmin(admin.ModelAdmin):
    list_display = ('year', 'semester')
    ordering = ('year','semester')


admin.site.register(TimeTable, TimeTableAdmin)

# Register your models here.
