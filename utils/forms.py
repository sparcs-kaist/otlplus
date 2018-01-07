# -*- coding: utf-8
from django import forms
from datetime import datetime

class DateTimeRange(object):
    def __init__(self, date, time_start, time_end):
        self.date = date
        self.time_start = time_start
        self.time_end = time_end

class MultipleDateTimeRangeField(forms.Field):
    widget = forms.HiddenInput

    def __init__(self, *args, **kwargs):
        super(MultipleDateTimeRangeField, self).__init__(*args, **kwargs)

    def clean(self, value):
        super(MultipleDateTimeRangeField, self).clean(value)
        if value in forms.fields.EMPTY_VALUES:
            return None

        try:
            tokens = value.split(',')
            result = []
            for token in tokens:
                if token in forms.fields.EMPTY_VALUES:
                    continue
                parts = token.split('/')
                ranges = parts[1].split('-')
                thedate = datetime.strptime(parts[0], '%Y-%m-%d').date()
                time_start = datetime.strptime(ranges[0], '%H:%M').time()
                time_end = datetime.strptime(ranges[1], '%H:%M').time()
                result.append(DateTimeRange(thedate, time_start, time_end))
        except (IndexError, ValueError):
            raise forms.ValidationError(u'The input could not be parsed.')
        return result

# MultiSelectField customization from http://www.djangosnippets.org/snippets/1200/
class MultiSelectFormField(forms.MultipleChoiceField):
    widget = forms.CheckboxSelectMultiple

    def __init__(self, *args, **kwargs):
        self.max_choices = kwargs.pop('max_choices', 0)
        super(MultiSelectFormField, self).__init__(*args, **kwargs)

    def clean(self, value):
        if not value and self.required:
            raise forms.ValidationError(self.error_messages['required'])
        if value and self.max_choices and len(value) > self.max_choices:
            raise forms.ValidationError(u'You must select a maximum of %s choice%s.'
                    % (apnumber(self.max_choices), pluralize(self.max_choices)))
        return value

