import json

from django.db.models import Q
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import apply_offset_and_limit, apply_order, getint, patch_object

from .models import Review, ReviewVote

class ReviewListView(View):
    MAX_LIMIT = 50
    DEFAULT_ORDER = ['-written_datetime', '-id']

    def get(self, request):
        reviews = Review.objects.all()

        lecture_query = Q()
        lecture_year = getint(request.GET, "lecture_year", None)
        if lecture_year is not None:
            lecture_query &= Q(lecture__year=lecture_year)
        lecture_semester = getint(request.GET, "lecture_semester", None)
        if lecture_semester is not None:
            lecture_query &= Q(lecture__semester=lecture_semester)
        reviews = reviews.filter(lecture_query)

        reviews = reviews \
            .distinct()

        response_type = request.GET.get("response_type", None)
        if response_type == "count":
            return JsonResponse(reviews.count(), safe=False)

        reviews = apply_order(reviews, request.GET, ReviewListView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, request.GET, ReviewListView.MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)

    def post(self, request):
        body = json.loads(request.body.decode("utf-8"))

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)

        content = body.get("content", "")
        if not (content and len(content)):
            return HttpResponseBadRequest("Missing or empty field 'content' in request data")

        lecture_id = body.get("lecture", None)
        if not lecture_id:
            return HttpResponseBadRequest("Missing field 'lecture' in request data")

        grade = getint(body, "grade")
        load = getint(body, "load")
        speech = getint(body, "speech")
        if not (1 <= grade <= 5 and 1 <= load <= 5 and 1 <= speech <= 5):
            return HttpResponseBadRequest(
                "Wrong field(s) 'grade', 'load', and/or 'speech' in request data")

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

        user = request.user
        if user is None or not user.is_authenticated:
            return HttpResponse(status=401)
        if not review.writer == user.userprofile:
            return HttpResponse(status=401)

        if review.is_deleted:
            return HttpResponseBadRequest("Target review deleted by admin")

        content = body.get("content", None)
        if len(content) == 0:
            return HttpResponseBadRequest("Empty field 'content' in request data")

        grade = getint(body, "grade", None)
        load = getint(body, "load", None)
        speech = getint(body, "speech", None)
        if not (1 <= grade <= 5 and 1 <= load <= 5 and 1 <= speech <= 5):
            return HttpResponseBadRequest(
                "Wrong field(s) 'grade', 'load', and/or 'speech' in request data")

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
        profile = request.user.userprofile
        if profile.id != int(user_id):
            return HttpResponse(status=401)
        reviews = Review.objects.filter(votes__userprofile=profile)

        reviews = apply_order(reviews, request.GET, UserInstanceLikedReviewsView.DEFAULT_ORDER)
        reviews = apply_offset_and_limit(reviews, request.GET,
                                         UserInstanceLikedReviewsView.MAX_LIMIT)
        result = [r.to_json(user=request.user) for r in reviews]
        return JsonResponse(result, safe=False)
