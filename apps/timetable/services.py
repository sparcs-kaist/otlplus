from apps.subject.models import Lecture
from .models import Timetable
from apps.session.models import UserProfile
from typing import List, Optional, Tuple

from django.conf import settings
from PIL import Image, ImageDraw, ImageFont


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


def get_timetable_entries(profile: UserProfile, table_id: int, year: int, semester: int) -> Optional[List[Lecture]]:
    if profile is None:
        return None

    if table_id == MY_TIMETABLE_ID:
        return list(profile.taken_lectures.filter(year=year, semester=semester))

    try:
        table = Timetable.objects.get(user=profile, id=table_id, year=year, semester=semester)
    except Timetable.DoesNotExist:
        return None

    return list(table.lectures.all())


def draw_rounded_rectangle(draw, points: Tuple[int, int, int, int], radius: int, color):
    draw.pieslice([points[0], points[1], points[0] + radius * 2, points[1] + radius * 2], 180, 270, color)
    draw.pieslice([points[2] - radius * 2, points[1], points[2], points[1] + radius * 2], 270, 0, color)
    draw.pieslice([points[2] - radius * 2, points[3] - radius * 2, points[2], points[3]], 0, 90, color)
    draw.pieslice([points[0], points[3] - radius * 2, points[0] + radius * 2, points[3]], 90, 180, color)
    draw.rectangle([points[0], points[1] + radius, points[2], points[3] - radius], color)
    draw.rectangle([points[0] + radius, points[1], points[2] - radius, points[3]], color)


def slice_text_to_fit_width(text: str, width: int, font: ImageFont) -> List[str]:
    sliced = []
    slice_start_index = 0

    for i in range(len(text)):
        if font.getsize(text[slice_start_index : (i + 1)])[0] > width:
            sliced.append(text[slice_start_index:i])
            slice_start_index = i
    sliced.append(text[slice_start_index:].strip())

    return sliced


def draw_textbox(draw, points: Tuple[int, int, int, int], title: str, professor: str, location: str, font: ImageFont):
    width = points[2] - points[0]
    height = points[3] - points[1]

    sliced_title = slice_text_to_fit_width(title, width, font)
    sliced_professor = slice_text_to_fit_width(professor, width, font)
    sliced_location = slice_text_to_fit_width(location, width, font)

    sliced = []
    textHeight = 0

    for i in range(len(sliced_title) + len(sliced_professor) + len(sliced_location)):
        if i == len(sliced_title):
            sliced.append(("", 2, (0, 0, 0, 128)))
            textHeight += 2
        elif i == len(sliced_title) + len(sliced_professor):
            sliced.append(("", 2, (0, 0, 0, 128)))
            textHeight += 2

        if i < len(sliced_title):
            sliced.append((sliced_title[i], 24, (0, 0, 0, 204)))
            textHeight += 24
        elif i < len(sliced_title) + len(sliced_professor):
            sliced.append((sliced_professor[i - len(sliced_title)], 24, (0, 0, 0, 128)))
            textHeight += 24
        else:
            sliced.append((sliced_location[i - len(sliced_title) - len(sliced_professor)], 24, (0, 0, 0, 128)))
            textHeight += 24

        if textHeight > height:
            textHeight -= sliced.pop()[1]
            break

    topPad = (height - textHeight) // 2

    textPosition = 0
    for s in sliced:
        draw.text((points[0], points[1] + topPad + textPosition), s[0], fill=s[2], font=font)
        textPosition += s[1]


def create_timetable_image(lecture_list: List[Lecture]):
    if settings.DEBUG:
        file_path = "static/"
    else:
        file_path = "/var/www/otlplus/static/"

    image = Image.open(file_path + "img/Image_template.png")
    draw = ImageDraw.Draw(image)
    text_image = Image.new("RGBA", image.size)
    text_draw = ImageDraw.Draw(text_image)
    font = ImageFont.truetype(file_path + "fonts/NanumBarunGothic.ttf", 22)

    for lecture in lecture_list:
        lecture_dict = lecture.toJson(nested=False)
        color = TIMETABLE_CELL_COLORS[lecture_dict["course"] % 16]
        for class_time in lecture_dict["classtimes"]:
            day = class_time["day"]
            begin = class_time["begin"] // 30 - 16
            end = class_time["end"] // 30 - 16

            points = (178 * day + 76, 40 * begin + 158, 178 * (day + 1) + 69, 40 * end + 151)
            draw_rounded_rectangle(draw, points, 4, color)

            points = (points[0] + 12, points[1] + 8, points[2] - 12, points[3] - 8)
            draw_textbox(
                text_draw,
                points,
                lecture_dict["title"],
                lecture.get_professors_short_str(),
                class_time["classroom_short"],
                font,
            )

    # image.thumbnail((600,900))

    image.paste(text_image, mask=text_image)
    return image
