# -*- coding: utf-8 -*-

# Django apps
from apps.session.models import UserProfile
from .models import Timetable, Wishlist
from apps.subject.models import Lecture, Semester
from apps.subject.models import *
from utils.util import getint

# Django modules
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.contrib.auth.decorators import login_required
from utils.decorators import login_required_ajax
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .services import get_timetable_entries

import json

# Pillow
from PIL import Image, ImageDraw, ImageFont


def _validate_year_semester(year, semester):
    return Semester.objects.filter(year=year, semester=semester).exists() \
        or (2009 < year < 2018 and semester in [1, 3]) # TODO: Complete Semester instances and remove this condition



@login_required_ajax
@require_http_methods(['GET', 'POST'])
def user_instance_timetable_list_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    if request.method == 'GET':
        timetables = userprofile.timetables.all()
        
        year = getint(request.GET, 'year', None)
        if year is not None:
            timetables = timetables.filter(year=year)

        semester = getint(request.GET, 'semester', None)
        if year is not None:
            timetables = timetables.filter(semester=semester)

        result = [t.toJson() for t in timetables]
        return JsonResponse(result, safe=False)
    
    elif request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        year = body.get('year', None)
        semester = body.get('semester', None)
        if year is None:
            return HttpResponseBadRequest('Missing field \'year\' in request data')
        if semester is None:
            return HttpResponseBadRequest('Missing field \'semester\' in request data')
        if not _validate_year_semester(year, semester):
            return HttpResponseBadRequest('Wrong fields \'year\' and \'semester\' in request data')

        lecture_ids = body.get('lectures', None)
        if lecture_ids is None:
            return HttpResponseBadRequest('Missing field \'lectures\' in request data')
        
        timetable = Timetable.objects.create(user=userprofile, year=year, semester=semester)
        for i in lecture_ids:
            try:
                lecture = Lecture.objects.get(id=i, year=year, semester=semester)
            except Lecture.DoesNotExist:
                return HttpResponseBadRequest('Wrong field \'lectures\' in request data')
            timetable.lectures.add(lecture)
        
        return JsonResponse(timetable.toJson())


@login_required_ajax
@require_http_methods(['GET', 'DELETE'])
def user_instance_timetable_instance_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()


    if request.method == 'GET':
        return JsonResponse(timetable.toJson())


    elif request.method == 'DELETE':
        timetable.delete()
        return HttpResponse()



@login_required_ajax
@require_http_methods(['POST'])
def user_instance_timetable_instance_add_lecture_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()


    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        lecture_id = getint(body, 'lecture', None)
        if lecture_id is None:
            return HttpResponseBadRequest('Missing field \'lecture\' in request data')

        lecture = Lecture.objects.get(id=lecture_id)
        if not (lecture.year == timetable.year and lecture.semester == timetable.semester):
            return HttpResponseBadRequest('Wrong field \'lecture\' in request data')

        timetable.lectures.add(lecture)
        return JsonResponse(timetable.toJson())



@login_required_ajax
@require_http_methods(['POST'])
def user_instance_timetable_instance_remove_lecture_view(request, user_id, timetable_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    try:
        timetable = userprofile.timetables.get(id=timetable_id)
    except Timetable.DoesNotExist:
        return HttpResponseNotFound()


    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        lecture_id = getint(body, 'lecture', None)
        if lecture_id is None:
            return HttpResponseBadRequest('Missing field \'lecture\' in request data')

        lecture = Lecture.objects.get(id=lecture_id)

        timetable.lectures.remove(lecture)
        return JsonResponse(timetable.toJson())


@login_required_ajax
@require_http_methods(['GET'])
def user_instance_wishlist_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]


    if request.method == 'GET':
        result = wishlist.toJson()
        return JsonResponse(result)



@login_required_ajax
@require_http_methods(['POST'])
def user_instance_wishlist_add_lecture_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]


    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        lecture_id = getint(body, 'lecture', None)
        if lecture_id is None:
            return HttpResponseBadRequest('Missing field \'lecture\' in request data')

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.add(lecture)

        result = wishlist.toJson()
        return JsonResponse(result)



@login_required_ajax
@require_http_methods(['POST'])
def user_instance_wishlist_remove_lecture_view(request, user_id):
    userprofile = request.user.userprofile
    if userprofile.id != int(user_id):
        return HttpResponse(status=401)

    wishlist = Wishlist.objects.get_or_create(user=userprofile)[0]


    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))

        lecture_id = getint(body, 'lecture', None)
        if lecture_id is None:
            return HttpResponseBadRequest('Missing field \'lecture\' in request data')

        lecture = Lecture.objects.get(id=lecture_id)

        wishlist.lectures.remove(lecture)

        result = wishlist.toJson()
        return JsonResponse(result)



# Export OTL timetable to google calendar
@login_required
@require_http_methods(['GET'])
def share_timetable_calendar_view(request):
    userprofile = request.user.userprofile

    if request.method == 'GET':
        table_id = getint(request.GET, 'timetable', None)
        year = getint(request.GET, 'year', None)
        semester = getint(request.GET, 'semester', None)
        if not (
            table_id is not None
            and year is not None
            and semester is not None
        ):
            return HttpResponseBadRequest('Missing fields in request data')

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest('No such timetable')

        # TODO: Add impl
        return HttpResponseBadRequest('Not implemented')
        # response = _share_calendar(request, timetable_lectures, year, semester)
        # return response



def draw_rounded_rectangle(draw, points: Tuple[int, int, int, int], radius: int, color):
    draw.pieslice([points[0], points[1], points[0]+radius*2, points[1]+radius*2], 180, 270, color)
    draw.pieslice([points[2]-radius*2, points[1], points[2], points[1]+radius*2], 270, 0, color)
    draw.pieslice([points[2]-radius*2, points[3]-radius*2, points[2], points[3]], 0, 90, color)
    draw.pieslice([points[0], points[3]-radius*2, points[0]+radius*2, points[3]], 90, 180, color)
    draw.rectangle([points[0], points[1]+radius, points[2], points[3]-radius], color)
    draw.rectangle([points[0]+radius, points[1], points[2]-radius, points[3]], color)


def slice_text_to_fit_width(text: str, width: int, font: ImageFont) -> List[str]:
    sliced = []
    slStart = 0

    for i in range(len(text)):
        if font.getsize(text[slStart:i+1])[0] > width:
            sliced.append(text[slStart:i])
            slStart = i
    sliced.append(text[slStart:].strip())

    return sliced



def draw_textbox(draw, points, title: str, professor: str, location: str, font: ImageFont):
    width = points[2] - points[0]
    height = points[3] - points[1]

    sliced_title = slice_text_to_fit_width(title, width, font)
    sliced_professor = slice_text_to_fit_width(professor, width, font)
    sliced_location = slice_text_to_fit_width(location, width, font)

    sliced = []
    textHeight = 0

    for i in range(len(sliced_title)+len(sliced_professor)+len(sliced_location)):
        if i == len(sliced_title):
            sliced.append(("", 2, (0,0,0,128)))
            textHeight += 2
        elif i == len(sliced_title)+len(sliced_professor):
            sliced.append(("", 2, (0,0,0,128)))
            textHeight += 2

        if i < len(sliced_title):
            sliced.append((sliced_title[i], 24, (0,0,0,204)))
            textHeight += 24
        elif i < len(sliced_title)+len(sliced_professor):
            sliced.append((sliced_professor[i-len(sliced_title)], 24, (0,0,0,128)))
            textHeight += 24
        else:
            sliced.append((sliced_location[i-len(sliced_title)-len(sliced_professor)], 24, (0,0,0,128)))
            textHeight += 24

        if textHeight > height:
            textHeight -= sliced.pop()[1]
            break

    topPad = (height - textHeight) // 2

    textPosition = 0
    for s in sliced:
        draw.text((points[0], points[1]+topPad+textPosition), s[0], fill=s[2], font=font)
        textPosition += s[1]



@login_required
@require_http_methods(['GET'])
def share_timetable_image_view(request):
    userprofile = request.user.userprofile

    if request.method == 'GET':
        table_id = getint(request.GET, 'timetable', None)
        year = getint(request.GET, 'year', None)
        semester = getint(request.GET, 'semester', None)
        if not (
            table_id is not None
            and year is not None
            and semester is not None
        ):
            return HttpResponseBadRequest('Missing fields in request data')

        timetable_lectures = get_timetable_entries(userprofile, table_id, year, semester)
        if timetable_lectures is None:
            return HttpResponseBadRequest('No such timetable')

        response = HttpResponse(content_type="image/png")
        image = create_timetable_image(timetable_lectures)
        image.save(response, 'PNG')
        return response


TIMETABLE_CELL_COLORS = ['#F2CECE','#F4B3AE','#F2BCA0','#F0D3AB',
                         '#F1E1A9','#f4f2b3','#dbf4be','#beedd7',
                         '#b7e2de','#c9eaf4','#B4D3ED','#B9C5ED',
                         '#CCC6ED','#D8C1F0','#EBCAEF','#f4badb']



def create_timetable_image(timetable_lectures):
    if settings.DEBUG:
        file_path = 'static/'
    else:
        file_path = '/var/www/otlplus/static/'

    image = Image.open(file_path+"img/Image_template.png")
    draw = ImageDraw.Draw(image)
    text_image = Image.new("RGBA", image.size)
    text_draw = ImageDraw.Draw(text_image)
    font = ImageFont.truetype(file_path+"fonts/NanumBarunGothic.ttf", 22)

    for lecture in timetable_lectures:
        lecture_dict = lecture.toJson(nested=False)
        color = TIMETABLE_CELL_COLORS[lecture_dict['course']%16]
        for class_time in lecture_dict['classtimes']:
            day = class_time['day']
            begin = class_time['begin'] // 30 - 16
            end = class_time['end'] // 30 - 16

            points = (178*day+76, 40*begin+158, 178*(day+1)+69, 40*end+151)
            draw_rounded_rectangle(draw, points, 4, color)

            points = (points[0]+12, points[1]+8, points[2]-12, points[3]-8)
            draw_textbox(text_draw, points, lecture_dict['title'], lecture.get_professors_short_str(), class_time['classroom_short'], font)

    #image.thumbnail((600,900))

    image.paste(text_image, mask=text_image)
    return image
