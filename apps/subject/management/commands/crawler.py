# -*- coding: utf-8
from django.core.management.base import BaseCommand, CommandError
from apps.subject.models import Department, Professor, Lecture
from django.db.models import Count

from bs4 import BeautifulSoup
import requests
import lxml

class Command(BaseCommand):
    help = u'get email'
    option_list = BaseCommand.option_list
    base_url = u'https://ssogw6.kaist.ac.kr/syllabusInfo'

    def handle(self, *args, **options):
        #dupes = Professor.objects.values('professor_name').annotate(Count('id')).order_by().filter(id__count__gt=1)
	#dupes = Professor.objects.filter(professor_name__in=[item['professor_name'] for item in dupes])
	email_to_professor = self.crawl_email()
	for val in email_to_professor.values():
	    if len(val) > 1:
                print val 

    def crawl_email(self):
	email_to_professor = {}
        for lec in Lecture.objects.all():
            try:
                r = requests.get(Command.base_url, params={'year': lec.year, 'term': lec.semester,
                                                           'subject_no': lec.code, 'lecture_class': lec.class_no,
                                                           'dept_id': lec.department.id})
            	soup = BeautifulSoup(r.text, "lxml")
            	professors = soup.select('#professors > table')
		for row in professors:
		    col = row.select('tr > td')
	            name = col[1].text.strip()
		    name = name[:name.index('(')]
		    email = col[4].text.strip()
		    dup_p = list(lec.professor.filter(professor_name=name))
                  if email in email_to_professor:
		      email_to_professor['email'].extends(dup_p)
		      email_to_professor['email'] = list(set(email_to_professor['email']))
		  else:
		      email_to_professor['email'] = dup_p
                      
            except Exception as e:
                print "Cannot get " + lec.code + " lecture"

        return email_to_professor
