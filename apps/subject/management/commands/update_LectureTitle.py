#-*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.subject.models import Lecture
import itertools

class Command(BaseCommand):
    # Finds logest common string from front of given strings
    def _lcs_front(self, ls):
        if len(ls)==0:
          return ""
        result = ""
        for i in range(len(ls[0]), 0, -1): # [len(ls[0]),...,2,1]
          flag = True
          for l in ls:
            if l[0:i] != ls[0][0:i]:
              flag = False
          if flag:
            result = l[0:i]
            break
        while (len(result) > 0) and (result[-1] in ['<', '(', '[', '{']):
          result = result[:-1]
        return result

    # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
    def _add_title_format(self, lectures):
        if len (lectures) == 1:
          title = lectures[0].title
          if title[-1] == '>':
            common_title = title[:title.find('<')]
          else:
            common_title = title
        else:
          common_title = self._lcs_front([l.title for l in lectures])

        for l in lectures:
          l.common_title = common_title
          if l.title != common_title:
            l.class_title = l.title[len(common_title):]
          elif len(l.class_no) > 0:
            l.class_title = l.class_no
          else:
            l.class_title = u'A'
          l.save()

        return lectures

    # Add common and class title for lectures like 'XXX<AAA>', 'XXX<BBB>'
    def _add_title_format_en(self, lectures):
        if len (lectures) == 1:
          title = lectures[0].title_en
          if title[-1] == '>':
            common_title = title[:title.find('<')]
          else:
            common_title = title
        else:
          common_title = self._lcs_front([l.title_en for l in lectures])

        for l in lectures:
          l.common_title_en = common_title
          if l.title_en != common_title:
            l.class_title_en = l.title_en[len(common_title):]
          elif len(l.class_no) > 0:
            l.class_title_en = l.class_no
          else:
            l.class_title_en = u'A'
          l.save()

        return lectures

    def add_arguments(self,parser):
        parser.add_argument('--all', dest='all', type=bool, default=False)
        parser.add_argument('--year', dest='year', type=int)
        parser.add_argument('--semester', dest='semester', type=int)
        parser.add_argument('--verbose', dest='verbose', type=bool, default=True)

    def handle(self, *args, **options):
        if options['all']:
          if options['verbose']: print("Start updating Lecture title for semester:ALL")
          lectures = list(Lecture.objects.all())
        elif options['year']!=None or options['semester']!=None:
          if options['verbose']: print("Start updating Lecture title for semester:%d.%d" % (options['year'],options['semester']))
          lectures = list(Lecture.objects.filter(year=options['year'], semester=options['semester']))
        else:
          if options['verbose']: print("Start updating Lecture title for semester:%d.%d" % (settings.CURRENT_YEAR,settings.CURRENT_SEMESTER))
          lectures = list(Lecture.objects.filter(year=settings.CURRENT_YEAR, semester=settings.CURRENT_SEMESTER))

        lectures.sort(key = lambda x: x.course)
        lectures_grouped = [[x for x in value] for key,value in itertools.groupby(lectures, key = lambda x: x.course)]

        n = len(lectures_grouped)
        i = 0
        for g in lectures_grouped:
            if options['verbose']: print("[%d/%d]:%s" % (i, n, g))
            i += 1
            self._add_title_format(g)
            self._add_title_format_en(g)
