from enum import Enum
from typing import List, Optional, Tuple
import datetime
import pytz
from PIL import Image, ImageDraw, ImageFont
from icalendar import Calendar, Event, Alarm

from django.conf import settings
from django.db.models import F, Case, When

from apps.session.models import UserProfile
from apps.subject.models import ClassTime, Lecture, Semester
from .models import Timetable


MY_TIMETABLE_ID = -1
TIMETABLE_CELL_COLORS = [
    "#F2CECE",
    "#F4B3AE",
    "#F2BCA0",
    "#F0D3AB",
    "#F1E1A9",
    "#f4f2b3",
    "#dbf4be",
    "#beedd7",
    "#b7e2de",
    "#c9eaf4",
    "#B4D3ED",
    "#B9C5ED",
    "#CCC6ED",
    "#D8C1F0",
    "#EBCAEF",
    "#f4badb",
]

class TimetableType(Enum):
    FIVE_DAYS = "5days"
    SEVEN_DAYS = "7days"


def reorder_timetable(timetable: Timetable, target_arrange_order: int):
    related_timetables = Timetable.get_related_timetables(timetable.user,
                                                          timetable.year, timetable.semester)
    original_arrange_order = timetable.arrange_order

    if target_arrange_order < original_arrange_order:
        related_timetables.filter(arrange_order__gte=target_arrange_order,
                                  arrange_order__lte=original_arrange_order) \
                          .update(arrange_order=Case(When(arrange_order=original_arrange_order,
                                                          then=target_arrange_order),
                                                     default=F("arrange_order")+1))
    elif target_arrange_order > original_arrange_order:
        related_timetables.filter(arrange_order__gte=original_arrange_order,
                                  arrange_order__lte=target_arrange_order) \
                          .update(arrange_order=Case(When(arrange_order=original_arrange_order,
                                                          then=target_arrange_order),
                                                     default=F("arrange_order")-1))


def get_timetable_entries(profile: UserProfile, table_id: int, year: int, semester: int) \
                         -> Optional[List[Lecture]]:
    if profile is None:
        return None

    if table_id == MY_TIMETABLE_ID:
        return list(profile.taken_lectures.filter(year=year, semester=semester, deleted=False))

    try:
        table = Timetable.objects.get(user=profile, id=table_id, year=year, semester=semester)
    except Timetable.DoesNotExist:
        return None

    return list(table.lectures.filter(deleted=False))

def _get_timetable_type(lectures: List[Lecture]) -> TimetableType:
    def _has_weekend():
        for lecture in lectures:
            classtimes: List[ClassTime] = lecture.classtimes.all()
            for classtime in classtimes:
                if classtime.day >= 5:
                    return True
                
        return False
            
    return TimetableType.SEVEN_DAYS if _has_weekend() else TimetableType.FIVE_DAYS

def _draw_rounded_rectangle(draw, points: Tuple[int, int, int, int], radius: int, color):
    draw.pieslice([points[0], points[1], points[0] + radius * 2, points[1] + radius * 2],
                  180, 270,
                  color)
    draw.pieslice([points[2] - radius * 2, points[1], points[2], points[1] + radius * 2],
                  270, 0,
                  color)
    draw.pieslice([points[2] - radius * 2, points[3] - radius * 2, points[2], points[3]],
                  0, 90,
                  color)
    draw.pieslice([points[0], points[3] - radius * 2, points[0] + radius * 2, points[3]],
                  90, 180,
                  color)
    draw.rectangle([points[0], points[1] + radius, points[2], points[3] - radius], color)
    draw.rectangle([points[0] + radius, points[1], points[2] - radius, points[3]], color)


def _slice_text_to_fit_width(text: str, width: int, font: ImageFont) -> List[str]:
    sliced = []
    slice_start_index = 0

    for i in range(len(text)):
        if font.getsize(text[slice_start_index : (i + 1)])[0] > width:
            sliced.append(text[slice_start_index:i])
            slice_start_index = i
    sliced.append(text[slice_start_index:].strip())

    return sliced


def _draw_textbox(draw,
                  points: Tuple[int, int, int, int],
                  title: str, professor: str, location: str,
                  font: ImageFont):
    width = points[2] - points[0]
    height = points[3] - points[1]

    sliced_title = _slice_text_to_fit_width(title, width, font)
    sliced_professor = _slice_text_to_fit_width(professor, width, font)
    sliced_location = _slice_text_to_fit_width(location, width, font)

    sliced = []
    text_total_height = 0

    for i in range(len(sliced_title) + len(sliced_professor) + len(sliced_location)):
        is_entry_ended = (i == len(sliced_title)) \
                         or (i == len(sliced_title) + len(sliced_professor))
        if is_entry_ended:
            sliced.append(("", 2, (0, 0, 0, 128)))
            text_total_height += 2

        if i < len(sliced_title):
            target_character = sliced_title[i]
            opacity = int(255 * 0.8)
        elif i < len(sliced_title) + len(sliced_professor):
            target_character = sliced_professor[i - len(sliced_title)]
            opacity = int(255 * 0.5)
        else:
            target_character = sliced_location[i - len(sliced_title) - len(sliced_professor)]
            opacity = int(255 * 0.5)
        sliced.append((target_character, 26, (0, 0, 0, opacity)))
        text_total_height += 26

        if text_total_height > height:
            text_total_height -= sliced.pop()[1]
            break

    topPad = (height - text_total_height) // 2
    offsetY = -6

    textPosition = 0
    for s in sliced:
        draw.text((points[0], points[1] + topPad + offsetY + textPosition), s[0], fill=s[2], font=font)
        textPosition += s[1]


def create_timetable_image(semester: Semester, lectures: List[Lecture], language: str):
    if settings.DEBUG:
        file_path = "static/"
    else:
        file_path = "/var/www/otlplus/static/"

    timetable_type = _get_timetable_type(lectures)
    image = Image.open(file_path + f"img/Image_template_{timetable_type.value}.png")
    draw = ImageDraw.Draw(image)
    text_image = Image.new("RGBA", image.size)
    text_draw = ImageDraw.Draw(text_image)
    semester_font = ImageFont.truetype(file_path + "fonts/NotoSansKR-Regular.otf", 30)
    tile_font = ImageFont.truetype(file_path + "fonts/NotoSansKR-Regular.otf", 24)

    is_english = language and ("en" in language)

    semester_name = semester.get_name(language=language).title()
    semester_name_begin = 952 if timetable_type == TimetableType.FIVE_DAYS else 952 + 350
    text_draw.text((semester_name_begin, 78),
                   semester_name,
                   fill=(204, 204, 204),
                   font=semester_font,
                   anchor="rs")

    for l in lectures:
        color = TIMETABLE_CELL_COLORS[l.course.id % 16]
        for ct in l.classtimes.all():
            day = ct.day
            begin = ct.get_begin_numeric() // 30 - 16
            end = ct.get_end_numeric() // 30 - 16

            points = (178 * day + 76, 40 * begin + 154, 178 * (day + 1) + 69, 40 * end + 147)
            _draw_rounded_rectangle(draw, points, 4, color)

            points = (points[0] + 12, points[1] + 8, points[2] - 12, points[3] - 8)
            _draw_textbox(
                text_draw,
                points,
                l.title if not is_english else l.title_en,
                l.get_professors_short_str() if not is_english else l.get_professors_short_str_en(),
                ct.get_classroom_strs()[4] if not is_english else ct.get_classroom_strs()[5],
                tile_font,
            )

    # image.thumbnail((600,900))

    image.paste(text_image, mask=text_image)
    return image


def create_timetable_ical(semester: Semester, lectures: List[Lecture], language: str):
    is_english = language and ("en" in language)

    timezone = pytz.timezone("Asia/Seoul")

    calendar = Calendar()
    calendar.add("prodid", "-//SPARCS//OTL Plus//")
    calendar.add("version", "2.0")
    calendar.add("x-wr-timezone", timezone)

    title = f"[OTL] {semester.get_name(language='en').title()}"
    calendar.add("summary", title)
    calendar.add("x-wr-calname", title)

    for l in lectures:
        for ct in l.classtimes.all():
            event = Event()
            event.add("summary",
                      l.title if not is_english else l.title_en)
            event.add("location",
                      ct.get_classroom_strs()[2] if not is_english else ct.get_classroom_strs()[3])

            days_ahead = ct.day - semester.beginning.weekday()
            if days_ahead < 0:
                days_ahead += 7
            first_class_date = semester.beginning + datetime.timedelta(days=days_ahead)
            event.add("dtstart", datetime.datetime.combine(first_class_date, ct.begin, timezone))
            event.add("dtend", datetime.datetime.combine(first_class_date, ct.end, timezone))
            event.add("rrule", {"freq": "weekly", "until": semester.end})

            alarm = Alarm()
            alarm.add("action", "DISPLAY")
            alarm.add("trigger", datetime.timedelta(minutes=-15))
            event.add_component(alarm)

            calendar.add_component(event)

    return calendar
