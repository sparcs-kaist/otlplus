from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

from utils.decorators import login_required_ajax
from utils.util import ParseType, parse_params

from apps.subject.models import Department
from apps.session.services import get_user_department_list
from .models import (
    FamousMajorReviewDailyFeed,
    FamousHumanityReviewDailyFeed,
    RankedReviewDailyFeed,
    ReviewWriteDailyUserFeed,
    RelatedCourseDailyUserFeed,
    RateDailyUserFeed,
)


@method_decorator(login_required_ajax, name="dispatch")
class UserInstanceFeedsView(View):
    def get(self, request, user_id):
        date = parse_params(request.GET, ("date", ParseType.STR, True, []))

        userprofile = request.user.userprofile
        if userprofile.id != int(user_id):
            return HttpResponse(status=401)

        department_codes = [
            d["code"]
            for d in get_user_department_list(request.user)
            if d["code"] != "Basic"
        ]
        departments = Department.objects.filter(code__in=department_codes, visible=True)
        famous_major_review_daily_feed_list = [
            FamousMajorReviewDailyFeed.get(date=date,
                                           department=d,
                                           departments_num=departments.count())
            for d in departments
        ]

        famous_humanity_review_daily_feed = FamousHumanityReviewDailyFeed.get(date=date)

        ranked_review_daily_feed = RankedReviewDailyFeed.get(date=date)

        review_write_daily_user_feed = ReviewWriteDailyUserFeed.get(date=date, user=userprofile)

        related_course_daily_user_feed = RelatedCourseDailyUserFeed.get(date=date, user=userprofile)

        rate_daily_user_feed = RateDailyUserFeed.get(date=date, user=userprofile)

        feeds = (
            famous_major_review_daily_feed_list
            + [famous_humanity_review_daily_feed]
            + [ranked_review_daily_feed]
            + [review_write_daily_user_feed]
            + [related_course_daily_user_feed]
            + [rate_daily_user_feed]
        )
        feeds = [f for f in feeds if f is not None]
        feeds = sorted(feeds, key=(lambda f: f.priority))
        result = [f.to_json(user=request.user) for f in feeds]
        return JsonResponse(result, safe=False)
