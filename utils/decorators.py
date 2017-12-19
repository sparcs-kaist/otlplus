# -*- coding: utf-8
from django.http import *
from django.shortcuts import render_to_response
from django.template import RequestContext

def login_required_ajax(function=None, response_content=u'You have to log in first'):
    """
    Decorator to replace Django's original login_required for AJAX calls.
    XMLHttpRequest objects process redirect reponses automatically and this may cause unwanted behaviour.
    """
    def decorate(view_func):
        def handler(request, *args, **kwargs):
            if request.user.is_authenticated():
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden(response_content)
        return handler

    return decorate(function)

def korean_required(function=None, response_content=u"Sorry. We are not ready to service in English"):
    """
    Decorator to prevent English access.
    """
    def decorate(view_func):
        def handler(request, *args, **kwargs):
            if request.session.get('django_language','ko') == 'ko' :
                return view_func(request, *args, **kwargs)
            return render_to_response('error.html',{'error_msg':response_content},context_instance=RequestContext(request))
        return handler
    return decorate(function)

