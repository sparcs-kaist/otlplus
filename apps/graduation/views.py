from django.shortcuts import render
from django.http import JsonResponse
from django.views import View

from .models import GeneralTrack, MajorTrack, AdditionalTrack

from utils.util import ParseType, parse_params, parse_body, ORDER_DEFAULT_CONFIG, OFFSET_DEFAULT_CONFIG, LIMIT_DEFAULT_CONFIG, apply_offset_and_limit, apply_order, patch_object


class TrackListView(View):
    def get(self, request):
        result = {
            'general': [gt.to_json() for gt in GeneralTrack.objects.all()],
            'major': [gt.to_json() for gt in MajorTrack.objects.all()],
            'additional': [gt.to_json() for gt in AdditionalTrack.objects.all()],
        }
        return JsonResponse(result, safe=False)
