# -*- coding:utf-8 -*-

from django.views.generic import *


class SearchView(TemplateView):
    # TODO change class-based view to function view
    template_name = 'review/search/search.html'


class SearchResultView(TemplateView):
    # TODO change class-based view to function view
    template_name = 'review/search/result.html'


class ReviewInsertView(TemplateView):
    # TODO change class-based view to function view
    template_name = 'review/review/insert.html'
