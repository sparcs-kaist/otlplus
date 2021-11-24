from django.core.management.base import BaseCommand
from apps.review.models import MajorBestReview, HumanityBestReview, Review
from datetime import timedelta
from django.utils import timezone
import random


class Command(BaseCommand):
    help = "BestReview Changer"

    def handle(self, *args, **options):
        print("BestReview changing start!")
        latest_date_end = timezone.now()
        latest_date_start = timezone.now() - timedelta(days=7)

        def get_key(r):
            return int(r.like / float(r.lecture.audience + 1))

        def get_best_reviews(reviews, min_liked_count, max_result_count):
            liked_count = max(min_liked_count, len(reviews) // 10)
            most_liked_reviews = sorted(list(reviews), key=get_key, reverse=True)[:liked_count]

            latest_reviews = list(reviews.filter(written_datetime__range=(latest_date_start, latest_date_end)))

            best_candidate_reviews = most_liked_reviews + latest_reviews
            if len(best_candidate_reviews) > max_result_count:
                result_reviews = random.sample(best_candidate_reviews, k=max_result_count)
            else:
                result_reviews = best_candidate_reviews

            return result_reviews

        humanity_reviews = Review.objects.filter(course__department__code="HSS")

        humanity_best_reviews = get_best_reviews(humanity_reviews, 50, 20)

        HumanityBestReview.objects.all().delete()
        for r in humanity_best_reviews:
            HumanityBestReview.objects.create(review=r)

        major_reviews = Review.objects.exclude(course__department__code="HSS")

        major_best_reviews = get_best_reviews(major_reviews, 2000, 1000)

        MajorBestReview.objects.all().delete()
        for r in major_best_reviews:
            MajorBestReview.objects.create(review=r)

        print("BestReview was changed")
