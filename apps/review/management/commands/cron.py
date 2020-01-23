from django.core.management.base import BaseCommand
from apps.review.models import MajorBestReview, HumanityBestReview, Review
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from django.db.models import Q
from apps.subject.models import Department
class Command(BaseCommand):
    help = 'BestComment Changer'
    def handle(self, *args, **options):
        print "BestComment changing start!"
        last_date = timezone.now()
        first_date = timezone.now() - timedelta(days = 1 )
        last_date_all = timezone.now()
        first_date_all = timezone.now() - timedelta(days = 600)
        Comment_latest = Review.objects.filter(written_datetime__range=(first_date, last_date))
        Comment_liberal = list(Comment_latest.filter(Q(course__department__code="HSS")))
        Comment_major = list(Comment_latest.filter(~Q(course__department__code="HSS")))

        def cmp1(a,b):
            r =(b.comment.like/float(b.comment.lecture.audience+1) - a.comment.like/float(a.comment.lecture.audience+1))
            if r>0.0 :
                return 1
            elif r<0.0:
                return -1
            else :
                return 0


        try :
            bComment_liberal=list(HumanityBestReview.objects.filter(comment__written_datetime__range=(first_date_all, last_date_all)))
        except:
            bComment_liberal=[]

        for sComment in Comment_liberal:
            bComment_liberal.append(HumanityBestReview(comment=sComment))
        bComment_liberal.sort(cmp1)
        lbcl = HumanityBestReview.objects.all()
        lbcl.delete()
        for i in range(50):
            try :
                bComment_liberal[i].save()
            except:
                continue


        try :
            bComment_major=list(MajorBestReview.objects.filter(comment__written_datetime__range=(first_date_all, last_date_all)))
        except:
            bComment_major=[]

        for sComment in Comment_major:
            bComment_major.append(MajorBestReview(comment=sComment))
        bComment_major.sort(cmp1)
        mbcl = MajorBestReview.objects.all()
        mbcl.delete()
        for department in Department.objects.all():
            comment_d = []
            for i in range(len(bComment_major)):
                if bComment_major[i].comment.course.department.code == department.code:
                    comment_d.append(bComment_major[i])
                for i in range(15):
                    try :
                        comment_d[i].save()
                    except:
                        continue


        print "BestComment was changed"
