from django.contrib import admin
from .models import Timetable


@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ("year", "semester")
    ordering = ("year", "semester")
