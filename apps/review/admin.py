from django.contrib import admin
from .models import Review, MajorBestReview, HumanityBestReview


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    raw_id_fields = ('course', 'lecture', 'writer',)


@admin.register(MajorBestReview)
class MajorBestReviewAdmin(admin.ModelAdmin):
    pass


@admin.register(HumanityBestReview)
class HumanityBestReviewAdmin(admin.ModelAdmin):
    pass
