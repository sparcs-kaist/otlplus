# -*- coding: utf-8 -*-
from django import template
from otl.apps.common import *
from otl.utils import get_choice_display

from django.utils.translation import ugettext_lazy

register = template.Library()

@register.filter
def term2str(value):
    return ugettext_lazy(get_choice_display(SEMESTER_TYPES, value))
