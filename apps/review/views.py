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
    MAX_LIMIT = 50
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request):
        lecture_year = parse_params(request.GET, ("lecture_year", ParseType.INT, False, []))
        lecture_semester = parse_params(request.GET, ("lecture_semester", ParseType.INT, False, []))
        response_type = parse_params(request.GET, ("response_type", ParseType.STR, False, []))
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, OFFSET_DEFAULT_CONFIG)
        limit = parse_params(request.GET, LIMIT_DEFAULT_CONFIG)

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

        reviews = apply_order(reviews, order, ReviewListView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit, ReviewListView.MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)

    def post(self, request):
        body = json.loads(request.body.decode("utf-8"))

        content = parse_body(body, ("content", ParseType.STR, True, [
            lambda content: len(content.strip()) > 0
        ]))
        lecture_id = parse_body(body, ("lecture", ParseType.INT, True, []))
        grade = parse_body(body, ("grade", ParseType.INT, True, [lambda grade: 1 <= grade <= 5]))
        load = parse_body(body, ("load", ParseType.INT, True, [lambda load: 1 <= load <= 5]))
        speech = parse_body(body, ("speech", ParseType.INT, True, [lambda speech: 1 <= speech <= 5]))

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
        review = get_object_or_404(Review, id=review_id)

        body = json.loads(request.body.decode("utf-8"))

        content = parse_body(body, ("content", ParseType.STR, False, [
            lambda content: len(content.strip()) > 0
        ]))
        grade = parse_body(body, ("grade", ParseType.INT, False, [lambda grade: 1 <= grade <= 5]))
        load = parse_body(body, ("load", ParseType.INT, False, [lambda load: 1 <= load <= 5]))
        speech = parse_body(body, ("speech", ParseType.INT, False, [lambda speech: 1 <= speech <= 5]))


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
    MAX_LIMIT = 300
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request, user_id):
        order = parse_params(request.GET, ORDER_DEFAULT_CONFIG)
        offset = parse_params(request.GET, ("offset", ParseType.INT, False, []))
        limit = parse_params(request.GET, ("limit", ParseType.INT, False, []))

        profile = request.user.userprofile
        if profile.id != int(user_id):
            return HttpResponse(status=401)
        reviews = Review.objects.filter(votes__userprofile=profile)

        reviews = apply_order(reviews, order, UserInstanceLikedReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, offset, limit,
                                         UserInstanceLikedReviewsView.MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)
