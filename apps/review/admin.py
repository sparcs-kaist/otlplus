from django.contrib import admin
from apps.review.models import Review, MajorBestReview, HumanityBestReview

class ReviewAdmin(admin.ModelAdmin):
    raw_id_fields = 'course', 'lecture', 'writer',
class MajorBestCommentAdmin(admin.ModelAdmin):
    pass
admin.site.register(Review,ReviewAdmin)
admin.site.register(MajorBestReview)
admin.site.register(HumanityBestReview)
