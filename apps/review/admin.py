from django.contrib import admin
from apps.review.models import Comment, MajorBestComment, LiberalBestComment

class CommentAdmin(admin.ModelAdmin):
    raw_id_fields = 'course', 'lecture', 'writer',
class MajorBestCommentAdmin(admin.ModelAdmin):
    pass
admin.site.register(Comment,CommentAdmin)
admin.site.register(MajorBestComment)
admin.site.register(LiberalBestComment)
