# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from apps.subject.models import Course, CourseFiltered, Lecture
from datetime import datetime, timedelta, time, date
from django.utils import timezone
class Command(BaseCommand):
    help = 'update coursefiltered'
    def handle(self, *args, **options):
        print "update coursefiltered start!"
        
        def MakeCourseFilteredBySemester(title, period):
            try:
                CourseFiltered.objects.get(title=title).delete()
            except:
                pass
            thissemester_coursefiltered = CourseFiltered(title=title) 
            thissemester_coursefiltered.save()
            thissemester_courses=[]

            def PeriodToYearSemester(num):
                now_year = timezone.now().year
                now_semester = ((timezone.now()-timedelta(days=365/12*2)).month+2)/3
                result_year = now_year
                if timezone.now().month<3:
                    result_year-=1
                result_semester = now_semester + num
                if result_semester < 1 or result_semester > 4 :
                    result_year += (result_semester-1)/4
                    result_semester = (result_semester-1)%4+1
                return (result_year, result_semester)


            for i in period:
                thisperiod = PeriodToYearSemester(i)
                thissemester_lectures = Lecture.objects.filter(year=thisperiod[0], semester=thisperiod[1])
                for lecture in thissemester_lectures:
                    thissemester_courses.append(lecture.course)
                thissemester_courses=list(set(thissemester_courses))
                for course in thissemester_courses:
                    thissemester_coursefiltered.courses.add(course)


        MakeCourseFilteredBySemester("NEXT", [1])
        MakeCourseFilteredBySemester("NOW", [0])
        MakeCourseFilteredBySemester("PREV", [-1])
        MakeCourseFilteredBySemester("RECENT", [-1,-2,-3,-4])

        print "update coursefiltered ended!"
