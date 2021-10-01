import json

from django.db.models import Q
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, patch_object

from .models import Review, ReviewVote

class ReviewListView(View):
    def get(self, request):
        MAX_LIMIT = 50
        DEFAULT_ORDER = ['-written_datetime', '-id']
        PARAMS_STRUCTURE = [
            ("lecture_year", ParseType.INT, False, []),
            ("lecture_semester", ParseType.INT, False, []),
            ("response_type", ParseType.STR, False, []),
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        lecture_year, lecture_semester, response_type, order, offset, limit = \
            parse_params(request.GET, PARAMS_STRUCTURE)

        reviews = Review.objects.all()

        lecture_query = Q()
        if lecture_year is not None:
            lecture_query &= Q(lecture__year=lecture_year)
        if lecture_semester is not None:
            lecture_query &= Q(lecture__semester=lecture_semester)
        reviews = reviews.filter(lecture_query)

        reviews = reviews \
            .distinct()

        if response_type == "count":
            return JsonResponse(reviews.count(), safe=False)

        reviews = apply_order(reviews, order, DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)

    def post(self, request):
        BODY_STRUCTURE = [
            ("content", ParseType.STR, True, [lambda content: len(content.strip()) > 0]),
            ("lecture", ParseType.INT, True, []),
            ("grade", ParseType.INT, True, [lambda grade: 1 <= grade <= 5]),
            ("load", ParseType.INT, True, [lambda load: 1 <= load <= 5]),
            ("speech", ParseType.INT, True, [lambda speech: 1 <= speech <= 5]),
        ]

        content, lecture_id, grade, load, speech = parse_body(request.body, BODY_STRUCTURE)

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)

        user_profile = user.userprofile
        lecture = user_profile.review_writable_lectures.get(id=lecture_id)
        course = lecture.course

        review = Review.objects.create(
            course=course,
            lecture=lecture,
            content=content,
            grade=grade,
            load=load,
            speech=speech,
            writer=user_profile,
        )
        return JsonResponse(review.to_json(user=request.user), safe=False)


class ReviewInstanceView(View):
    def get(self, request, review_id):
        review = get_object_or_404(Review, id=review_id)
        result = review.to_json(user=request.user)
        return JsonResponse(result)

    def patch(self, request, review_id):
        BODY_STRUCTURE = [
            ("content", ParseType.STR, False, [lambda content: len(content.strip()) > 0]),
            ("grade", ParseType.INT, False, [lambda grade: 1 <= grade <= 5]),
            ("load", ParseType.INT, False, [lambda load: 1 <= load <= 5]),
            ("speech", ParseType.INT, False, [lambda speech: 1 <= speech <= 5]),
        ]

        review = get_object_or_404(Review, id=review_id)

        content, grade, load, speech = parse_body(request.body, BODY_STRUCTURE)

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)
        if not review.writer == user.userprofile:
            return HttpResponse(status=401)

        if review.is_deleted:
            return HttpResponseBadRequest("Target review deleted by admin")

        patch_object(
            review,
            {
                "content": content,
                "grade": grade,
                "load": load,
                "speech": speech,
            },
        )
        return JsonResponse(review.to_json(user=request.user), safe=False)


@method_decorator(login_required_ajax, name="dispatch")
class ReviewInstanceLikeView(View):
    def post(self, request, review_id):
        review = get_object_or_404(Review, id=review_id)
        user_profile = request.user.userprofile

        if review.votes.filter(userprofile=user_profile).exists():
            return HttpResponseBadRequest("Already Liked")

        ReviewVote.objects.create(review=review, userprofile=user_profile)
        return HttpResponse()


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceLikedReviewsView(View):
    def get(self, request, user_id):
        MAX_LIMIT = 300
        DEFAULT_ORDER = ['-written_datetime', '-id']
        PARAMS_STRUCTURE = [
            ORDER_DEFAULT_CONFIG,
            OFFSET_DEFAULT_CONFIG,
            LIMIT_DEFAULT_CONFIG,
        ]

        order, offset, limit = parse_params(request.GET, PARAMS_STRUCTURE)

        profile = request.user.userprofile
        if profile.id != int(user_id):
            return HttpResponse(status=401)
        reviews = Review.objects.filter(votes__userprofile=profile)

        reviews = apply_order(reviews, order, DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)
