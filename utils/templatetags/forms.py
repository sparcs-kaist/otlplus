# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.inclusion_tag('snippets/form_as_table.html')
def print_form_as_table(form):
    return {'theform': form}

@register.inclusion_tag('snippets/form_as_oneline.html')
def print_form_as_oneline(form):
    return {'theform': form}
