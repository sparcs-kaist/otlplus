from django.contrib import admin
from .models import Timetable


class TimetableAdmin(admin.ModelAdmin):
    list_display = ('year', 'semester')
    ordering = ('year','semester')


admin.site.register(Timetable, TimetableAdmin)

# Register your models here.
