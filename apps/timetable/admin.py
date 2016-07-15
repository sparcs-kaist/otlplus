from django.contrib import admin
from apps.timetable.models import TimeTable

class TimeTableAdmin(admin.ModelAdmin):
	list_disply = ('year', 'semester', 'table_id')
	ordering = ('year','semester','table_id',)

admin.site.register(TimeTable, TimeTableAdmin)
	
# Register your models here.
