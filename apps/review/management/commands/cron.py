from django.core.management.base import BaseCommand
from apps.review.models import MajorBestReview, HumanityBestReview, Review
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from django.db.models import Q
from apps.subject.models import Department
class Command(BaseCommand):
    help = 'BestReview Changer'
    def handle(self, *args, **options):
        print "BestReview changing start!"
        last_date = timezone.now()
        first_date = timezone.now() - timedelta(days = 1 )
        last_date_all = timezone.now()
        first_date_all = timezone.now() - timedelta(days = 600)
        reviews_latest = Review.objects.filter(written_datetime__range=(first_date, last_date))
        reviews_humanity = list(reviews_latest.filter(Q(course__department__code="HSS")))
        reviews_major = list(reviews_latest.filter(~Q(course__department__code="HSS")))

        def cmp1(a,b):
            r =(b.review.like/float(b.review.lecture.audience+1) - a.review.like/float(a.review.lecture.audience+1))
            if r>0.0 :
                return 1
            elif r<0.0:
                return -1
            else :
                return 0


        try :
            best_reviews_humanity=list(HumanityBestReview.objects.filter(review__written_datetime__range=(first_date_all, last_date_all)))
        except:
            best_reviews_humanity=[]

        for c in reviews_humanity:
            best_reviews_humanity.append(HumanityBestReview(review=c))
        best_reviews_humanity.sort(cmp1)
        lbcl = HumanityBestReview.objects.all()
        lbcl.delete()
        for i in range(50):
            try :
                best_reviews_humanity[i].save()
            except:
                continue


        try :
            best_reviews_major=list(MajorBestReview.objects.filter(review__written_datetime__range=(first_date_all, last_date_all)))
        except:
            best_reviews_major=[]

        for c in reviews_major:
            best_reviews_major.append(MajorBestReview(review=c))
        best_reviews_major.sort(cmp1)
        mbcl = MajorBestReview.objects.all()
        mbcl.delete()
        for department in Department.objects.all():
            review_d = []
            for i in range(len(best_reviews_major)):
                if best_reviews_major[i].review.course.department.code == department.code:
                    review_d.append(best_reviews_major[i])
                for i in range(15):
                    try :
                        review_d[i].save()
                    except:
                        continue


        print "BestReview was changed"
