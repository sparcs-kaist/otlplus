from django.contrib import admin
from apps.review.models import Comment, MajorBestComment, LiberalBestComment

# Register your models here.

admin.site.register(Comment)
admin.site.register(MajorBestComment)
admin.site.register(LiberalBestComment)
