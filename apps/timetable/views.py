 # -*- coding: utf-8 -*-

 # Django apps
 from apps.session.models import UserProfile
 
 # Django modules
 from django.core.exceptions import *
 from django.http import *
 from django.contrib.auth.decorators import login_required
 from otl.utils.decorators import login_required_ajax
 from django.conf import settings
 
 # For google calender
 from apiclient import discovery
 import oauth2client
 from oauth2client import client
 from oauth2client import tools
 from oauth2client.client import OAuth2WebServerFlow
 from oauth2client.tools import run
 import datetime
 import httplib2

 # Misc
 import os
 
 @login_required_ajax
 def calendar(request):
     """Exports otl timetable to google calender
     """
     user = request.user
     try:
         userprofile = UserProfile.objects.get(user=user)
     except:
         raise ValidationError('no user profile')

     email = user.email
     if email is None:
         return JsonResponse({'result': 'EMPTY'},
                             json_dumps_params={'ensure_ascii': False, 'indent': 4})


     with open(os.path.join(settings.BASE_DIR), 'keys/client_secrets.json') as f:
         data = json.load(f.read())
     client_id = data['installed']['client_id']
     client_secret = data['installed']['client_secret']
     api_key = data['api_key']
         
     FLOW = OAuth2WebServerFlow(
             client_id=client_id,
             client_secret=client_secret,
             scope='https://www.googleapis.com/auth/calendar',
             user_agent='')

     store = oauth2client.file.Storage(path)
     credentials = store.get()
     if credentials is None or credentials.invalid:
         credentials = run(FLOW, store)

     http = credentials.authorize(httplib2.Http())
     service = discovery.build(serviceName='calender', version='v3', http=http, developerKey='blah')

     calendar_name = "[OTL]" + str(user) + "'s calendar"
     calendar = None
    
     if userprofile.calendar_id != None:
         try:
             calendar = service.calendars().get(calendarId = userprofile.calendar_id).execute()
             if calendar != None and calendar['summary'] != calendar_name:
                 calendar['summary'] = calendar_name
                 calendar = service.calendars().update(calendarId = calendar['id'], body = calendar).execute()
         except:
             pass

    if calendar == None:
        # Make a new calender

    # TODO: Add calendar entry
