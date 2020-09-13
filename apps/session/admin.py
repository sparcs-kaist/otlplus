from django.contrib import admin
from apps.session.models import UserProfile
# Register your models here.
class UserProfileAdmin(admin.ModelAdmin):
    raw_id_fields = 'taken_lectures',
admin.site.register(UserProfile, UserProfileAdmin)
