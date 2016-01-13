from django.core.management.base import BaseCommand
from apps.review.models import MajorBestComment, LiberalBestComment,Comment
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from django.db.models import Q
class Command(BaseCommand):
    help = 'BestComment Changer'
    def handle(self, *args, **options):
        print "BestComment changing start!"
        last_date = timezone.now()
        first_date = timezone.now() - timedelta(hours = 2 )
        Comment_latest = Comment.objects.filter(written_datetime__range=(first_date, last_date))
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
            bComment_liberal=list(LiberalBestComment.objects.all())
        except:
            bComment_liberal=[]

        for sComment in Comment_liberal:
            bComment_liberal.append(LiberalBestComment(comment=sComment))
        bComment_liberal.sort(cmp1)
        lbcl = LiberalBestComment.objects.all()
        lbcl.delete()
        for i in range(50):
            try :
                bComment_liberal[i].save()
            except:
                continue


        try :
            bComment_major=list(MajorBestComment.objects.all())
        except:
            bComment_major=[]

        for sComment in Comment_major:
            bComment_major.append(MajorBestComment(comment=sComment))
        bComment_major.sort(cmp1)
        mbcl = MajorBestComment.objects.all()
        mbcl.delete()
        for i in range(50):
            try :
                bComment_major[i].save()
            except:
                continue

                
        print "BestComment was changed"
