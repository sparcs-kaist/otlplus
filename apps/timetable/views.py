#-*- coding: utf-8 -*-
from django.shortcuts import render

def get_courses(department_name):
    department_name = department_name.encode('utf-8')
    dic = {'산업디자인학과':'발상과 표현', '전산학부':'운영체제 및 실험', '전기및전자공학부':'회로이론', '수리과학과':'해석학I', '건설및환경공학과':'재료역학', '바이오및뇌공학과':'Anatomy and Physiology', '산업및시스템공학과':'OR II','생명과학과':'세포생물학','원자력및양자공학과':'양자역학','기계공학과':'유체역학','인문사회과학부':'Introduction to Psycology', '물리학과':'고전물리학', '화학과':'물리화학'}
    return dic[department_name]

def my_encode(string):
    if isKorean(string):
        return string
    else:
        return string.encode('utf-8')

def isKorean(word):
    if len(word) <= 0:
        return False
    # UNICODE RANGE OF KOREAN: 0xAC00 ~ 0xD7A3
    for c in range(len(word)):
        if word[c] < u"\uac00" or word[c] > u"\ud7a3":
            return False
    return True

def main(request):
    return render(request, 'timetable/index.html')

def search_by_filter(request):
    if request.method == "POST":
        keyword = request.POST["keyword"]
        results = get_courses(keyword)
    else:
        results = ""
    ctx = { "results" : results }
    return render(request, 'timetable/filter2.html', ctx)
