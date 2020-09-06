from django.contrib import admin
from apps.timetable.models import Timetable


class TimetableAdmin(admin.ModelAdmin):
    list_display = ('year', 'semester')
    ordering = ('year','semester')


admin.site.register(Timetable, TimetableAdmin)

# Register your models here.
