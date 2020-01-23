from django.contrib import admin
from apps.review.models import Review, MajorBestComment, LiberalBestComment

class CommentAdmin(admin.ModelAdmin):
    raw_id_fields = 'course', 'lecture', 'writer',
class MajorBestCommentAdmin(admin.ModelAdmin):
    pass
admin.site.register(Review,CommentAdmin)
admin.site.register(MajorBestComment)
admin.site.register(LiberalBestComment)
