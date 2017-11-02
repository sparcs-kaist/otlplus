# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect, render_to_response
from django.template import RequestContext
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, CourseFiltered, Professor
from apps.review.models import Comment,CommentVote, MajorBestComment, LiberalBestComment
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.db.models import Q
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from math import exp
from itertools import groupby
from django.core.paginator import Paginator, InvalidPage
from django.core import serializers
import json
#testend
import random
import os
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.conf import settings


# global val###

gradelist = [(0,'?'),(1,'F'),(2,'F'),(3,'F'),(4,'F'),(5,'D-'),(6,'D'),(7,'D+'),(8,'C-'),(9,'C'),(10,'C+'),(11,'B-'),(12,'B'),(13,'B+'),(14,'A-'),(15,'A'),(16,'A+')]


# Filter Functions################################################################
def DepartmentFilters(raw_filters):
    department_list = []
    for department in Department.objects.all():
        department_list.append(department.code)
    major_list = ["CE", "MSB", "MAE", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS", "MS", "NQE", "HSS", "EE", "CS", "MAE", "CH"]
    etc_list = list(set(department_list)^set(major_list))
    if ("ALL" in raw_filters) or len(raw_filters)==0 :
        return department_list
    filters = list(set(department_list) & set(raw_filters))
    if "ETC" in raw_filters:
        filters += etc_list
    return filters


def TypeFilters(raw_filters):
    acronym_dic = {'GR':'General Required', 'MGC':'Mandatory General Courses', 'BE':'Basic Elective', 'BR':'Basic Required', 'EG':'Elective(Graduate)', 'HSE':'Humanities & Social Elective', 'OE':'Other Elective', 'ME':'Major Elective', 'MR':'Major Required', 'S':'Seminar', 'I':'Interdisciplinary', 'FP':'Field Practice'}
    type_list = acronym_dic.keys()
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters = [acronym_dic[i] for i in type_list if acronym_dic.has_key(i)]
        return filters
    acronym_filters = list(set(type_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'ETC' in raw_filters:
        filters +=["Seminar", "Interdisciplinary", "Field Practice"]
    return filters


def GradeFilters(raw_filters):
    acronym_dic = {'ALL':"", '000':"0", '100':"1", '200':"2", '300':"3", '400':"4", '500':"5", 'HIGH':"6"}
    grade_list = acronym_dic.keys()
    acronym_filters = list(set(grade_list) & set(raw_filters))
    filters = [acronym_dic[i] for i in acronym_filters if acronym_dic.has_key(i)]
    if 'HIGH' in raw_filters:
        filters+=["7", "8", "9"]
    if ('ALL' in raw_filters) or len(raw_filters)==0 :
        filters=["0","1","2","3","4","5","6","7","8","9"]
    return filters


def search_view(request):
    if not request.session.get('visited'):
        request.session['visited'] = True
        return HttpResponseRedirect("/tutorial/")
    if request.user.is_authenticated():
        user_profile = UserProfile.objects.get(user=request.user)
        if len(user_profile.language) == 0:
            return redirect("/session/settings/")

    comment_liberal = list(LiberalBestComment.objects.all())
    if request.user.is_authenticated():
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        comment_major = list(MajorBestComment.objects.filter(comment__course__department__code__in = [d.code for d in user_profile.favorite_departments.all()]))
    else:
        comment_major = list(MajorBestComment.objects.all())

    liberal_comment = []
    major_comment = []

    for i in range(3):
        try :
            j = random.randint(0, len(comment_liberal)-1)
            comment = comment_liberal[j].comment
            context = SearchComment(request, comment)
            liberal_comment.append(context)
            comment_liberal.pop(j)

        except Exception, e:
            print e

    for i in range(3):
        try:
            j = random.randint(0,len(comment_major)-1)

            comment = comment_major[j].comment
            context = SearchComment(request, comment)
            major_comment.append(context)
            comment_major.pop(j)

        except Exception, e:
            print e
    ctx = {
            'liberal_comment':liberal_comment,
            'major_comment':major_comment,
    }

    return render(request, 'review/search.html',ctx)


def search_view_first(request):
    return render(request, 'review/tutorial-main.html')


def search_view_first_again(request):
    drugs = [
        "하하! 다시보니 반갑군요!",
        "튜토리얼의 협곡에 오신 것을 환영합니다.",
        "안뇽! 튜토리얼에 온 걸...화녕행!!!!",
        "안녕! 친구들! 튜토리얼이 왔어!",
        "그대의 튜토리얼은 그대 스스로 클릭한 것이다.",
        "첫사랑이었다. 저 제비꽃같은 튜토리얼이 첫사랑이었다.",
        "너의 이름은? 튜토리얼! 나의 이름은 튜토리얼!",
        "그것도 무스..튜토리얼!",
        "어서 와요! 꽤 보고싶었다구요?",
        "아이고, 이게 누구신가!",
        "줄곧 무언가를, 누군가를 찾고 있다.",
        "첫 튜토리얼이 끝나고, 당신이 없는 시간을 견뎠습니다.",
        "튜토리얼이 끝나도 절대 잊지 않도록 이름을 써주세요.",
        "우리는 만나면 바로 알아볼거야!"
            ]
    return render(request, 'review/tutorial-main-2.html', {'hello_message': drugs[random.randint(0, len(drugs)-1)],})


def search_view_first2(request):
    return render(request, 'review/tutorial-sparcssso.html')


def search_view_first2_auth(request):
    return render(request, 'review/tutorial-sparcssso-auth.html')


def search_view_first3(request):
    return render(request, 'review/tutorial-write.html')


def search_view_first4(request):
    return render(request, 'review/tutorial-comeagain.html')
#####################################################################################################


def isKorean(word):
    if len(word) <= 0:
        return False
    # UNICODE RANGE OF KOREAN: 0xAC00 ~ 0xD7A3
    for c in range(len(word)):
        if word[c] < u"\uac00" or word[c] > u"\ud7a3":
            return False
    return True


def CalcAvgScore(grade_sum, load_sum, speech_sum, total_sum, comment_num):
    if comment_num == 0:
        grade = 0.0
        load = 0.0
        speech = 0.0
        total = 0.0
    else:
        grade = float(grade_sum)/comment_num
        load = float(load_sum)/comment_num
        speech = float(speech_sum)/comment_num
        total = float(total_sum)/comment_num
    return grade, load, speech, total


def GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword):
    if len(semester_filters)==0 or ("ALL" in semester_filters):
        courses = Course.objects.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)
    else :
        courses = CourseFiltered.objects.get(title=semester_filters[0]).courses.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)

    if len(keyword)>0:
        courses = courses.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__iexact=keyword) | Q(department__name__iexact=keyword) | Q(department__name_en__iexact=keyword))

    return courses


def KeyLecByProf(lecture):
    return sorted([i.id for i in lecture.professor.all()])


def GetLecByProf(lectures):
    lectures.sort(key = KeyLecByProf)
    lec_by_prof = groupby(lectures, KeyLecByProf)
    lec_by_prof = [ list(i[1]) for i in lec_by_prof ]
    return lec_by_prof


def SearchCourse(course,id=-1):
    lectures = list( course.lecture_course.all() )
    lec_by_prof = GetLecByProf(lectures)

    prof_info = []
    prof_info.append({
        "name" : "ALL",
        "id" : -1,
    })
    summury = "등록되지 않았습니다."
    score = {"grade":int(round(course.grade)), "load":int(round(course.load)), "speech":int(round(course.speech)), "total":int(round(course.total)),}

    for idx, lectures in enumerate(lec_by_prof):
        names = [i.professor_name for i in lectures[0].professor.all()]
        if len(names) == 1:
            name_string = names[0]
        elif len(names) == 2:
            name_string = names[0] + ', ' + names[1]
        elif len(names) > 2:
            name_string = names[0] + u' 외 %d명'%(len(names)-1)
        else:
            name_string = 'error'

        if int(idx) == int(id):
            grade_sum = sum(i.grade_sum for i in lectures)
            load_sum = sum(i.load_sum for i in lectures)
            speech_sum = sum(i.speech_sum for i in lectures)
            total_sum = sum(i.total_sum for i in lectures)
            comment_num = sum(i.comment_num for i in lectures)
            grade, load, speech, total = CalcAvgScore(grade_sum, load_sum, speech_sum, total_sum, comment_num)
            score = {"grade":int(round(grade)), "load":int(round(load)), "speech":int(round(speech)), "total":int(round(total)),}

        prof_info.append({
            "name" : name_string,
            "id" : idx,
        })
        summury = course.summury
        if(len(summury)<1):
            summury = "등록되지 않았습니다."
    result = {
        "type":"course",
        "id":course.id,
        "code":course.old_code,
        "title":course.title,
        "summury":summury,
        "prof_info":sorted(prof_info, key = lambda x : x['name']),
        "gradelist":gradelist,
        "score":score,
    }
    return result


def SearchComment(request, comment):
    is_login = False
    already_up = False
    comment_id = -1
    if request.user.is_authenticated():
        is_login = True
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        target_review = Comment.objects.get(id=comment.id);
        if CommentVote.objects.filter(comment = target_review, userprofile = user_profile).exists():
            already_up = True
    professors = comment.lecture.professor.all()
    professor_name = " " + ", ".join([i.professor_name for i in professors]) + " "
    semester_int = comment.lecture.semester # get semester info from subject/models.py
    semester_char = ""
    # 1 : spring, 2 : summer, 3 : fall, 4 : winter
    if semester_int == 1: semester_char = "봄"
    elif semester_int == 2: semester_char = "여름"
    elif semester_int == 3: semester_char = "가을"
    elif semester_int == 4: semester_char = "겨울"
    else: semester_char = "Error"
    result = {
        "type":"comment",
        "id":comment.id,
        "course_id":comment.course.id,
        "course_code":comment.course.old_code,
        "lecture_title":comment.lecture.title,
        "lecture_year":comment.lecture.year,
        "lecture_semester":semester_char,
        "professor_name":professor_name,
        "writer":comment.writer_label,
        "comment":comment.comment,
        "like":comment.like,
        "already_up":already_up,
        "score":{"grade":comment.grade, "load":comment.load, "speech":comment.speech, "total":int(round(comment.total)),},
        "gradelist":[(0,"?"),(1,"F"),(2,"D"),(3,"C"),(4,"B"),(5,"A")],
    }
    return result


def SearchProfessor(professor,id=-1):
    lecture_list=[]
    lecture_list.append({
        "name": "ALL",
        "id": -1,
    })

    score = {"grade":int(round(professor.grade)), "load":int(round(professor.load)), "speech":int(round(professor.speech)), "total":int(round(professor.total)),}

    for course in professor.course_list.all().order_by('title','old_code'):

        lecture_list.append({
            "id" : course.id,
            "name" : course.title,
        })

        if int(course.id) == int(id) :
            lectures = professor.lecture_professor.filter(course = course)
            grade_sum = sum(i.grade_sum for i in lectures)
            load_sum = sum(i.load_sum for i in lectures)
            speech_sum = sum(i.speech_sum for i in lectures)
            total_sum = sum(i.total_sum for i in lectures)
            comment_num = sum(i.comment_num for i in lectures)
            grade, load, speech, total = CalcAvgScore(grade_sum, load_sum, speech_sum, total_sum, comment_num)
            score = {"grade":int(round(grade)), "load":int(round(load)), "speech":int(round(speech)), "total":int(round(total)),}

            """
            grade = int(round(lecture.grade))
            load = int(round(lecture.load))
            speech = int(round(lecture.speech))
            total = int(round(lecture.total))
            score = {"grade":grade, "load":load, "speech":speech, "total":total,}
            """

    try:
        if len(professor.major) > 0:
            major = Department.objects.get(id = professor.major).name
        else:
            major = u"정보 없음"
    except Department.DoesNotExist:
        major = u"정보 없음"

    result = {
        "type": "professor",
        "id": professor.id,
        "title": professor.professor_name,
        "prof_info": lecture_list,
        "gradelist": gradelist,
        "major": major,
        "score": score,
    }
    return result


def Expectations(keyword):
    if not keyword:
        return
    expectations=[]
    expect_prof=[]
    expect_course=[]
    expect_prof = Professor.objects.filter(Q(professor_name__icontains=keyword) | Q(professor_name_en__icontains=keyword))
    expect_course = Course.objects.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__icontains=keyword))
    expect_temp=[]
    if isKorean(keyword):
        for profobj in expect_prof:
            expect_temp.append(profobj.professor_name)
        for courseobj in expect_course:
            expect_temp.append(courseobj.title)
    else:
        for profobj in expect_prof:
            expect_temp.append(profobj.professor_name_en)
        for courseobj in expect_course:
            expect_temp.append(courseobj.title_en)
    expectations = expect_temp
    return expectations


# MainPage#################################################################################################
def SearchResultView(request):
    if 'q' in request.GET :
        keyword = request.GET['q']
    else :
        keyword = ""

    semester_filters = request.GET.getlist('semester')
    department_filters = DepartmentFilters(request.GET.getlist('department'))
    type_filters = TypeFilters(request.GET.getlist('type'))
    grade_filters = GradeFilters(request.GET.getlist('grade'))
    courses = GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)
    if 'sort' in request.GET:
        if request.GET['sort'] == 'name':
            courses = courses.order_by('title','old_code')
        elif request.GET['sort'] == 'total':
            courses = courses.order_by('-total','old_code')
        elif request.GET['sort'] == 'grade':
            courses = courses.order_by('-grade','old_code')
        elif request.GET['sort'] == 'load':
            courses = courses.order_by('-load','old_code')
        elif request.GET['sort'] == 'speech':
            courses = courses.order_by('-speech','old_code')
        else:
            courses = courses.order_by('old_code')
    else:
        courses = courses.order_by('old_code')

    if len(keyword)>0:
        expectations = Professor.objects.filter(Q(professor_name__icontains=keyword)|Q(professor_name_en__icontains=keyword))
        expectations = [{"name":i.professor_name,"id":i.id} for i in expectations]
    else:
        expectations = []

    paginator = Paginator(courses,10)
    page_obj = paginator.page(1)

    results = [SearchCourse(i) for i in page_obj.object_list]

    context = {
            "results": results,
            "page":page_obj.number,
            "expectations":expectations,
            "keyword": keyword,
    }

    return render(request, 'review/result.html', context)


def SearchResultView_json(request, page):
    if 'q' in request.GET :
        keyword = request.GET['q']
    else :
        keyword = ""

    semester_filters = request.GET.getlist('semester')
    department_filters = DepartmentFilters(request.GET.getlist('department'))
    type_filters = TypeFilters(request.GET.getlist('type'))
    grade_filters = GradeFilters(request.GET.getlist('grade'))
    courses = GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)
    if 'sort' in request.GET :
        if request.GET['sort']=='name':
            courses = courses.order_by('title','old_code')
        elif request.GET['sort']=='total':
            courses = courses.order_by('-total','old_code')
        elif request.GET['sort']=='grade':
            courses = courses.order_by('-grade','old_code')
        elif request.GET['sort']=='load':
            courses = courses.order_by('-load','old_code')
        elif request.GET['sort']=='speech':
            courses = courses.order_by('-speech','old_code')
        else:
            courses = courses.order_by('old_code')
    else :
        courses = courses.order_by('old_code')

    paginator = Paginator(courses,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404

    results = [SearchCourse(i) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
            "keyword":keyword,
    }
    return JsonResponse(json.dumps(context),safe=False)


def SearchResultProfessorView(request,id=-1,course_id=-1):
    professor = Professor.objects.get(id=id)
    comments = Comment.objects.filter(lecture__professor__id=id).order_by('-lecture__year','-written_datetime')
    if int(course_id) != -1:
        comments = comments.filter(lecture__course__id=course_id)
    paginator = Paginator(comments,10)
    page_obj = paginator.page(1)
    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "result":SearchProfessor(professor,course_id),
            "results": results,
            "page":page_obj.number,
    }
    return render(request, 'review/sresult.html', context)


def SearchResultProfessorView_json(request, id=-1,course_id=-1,page=-1):
    comments = Comment.objects.filter(lecture__professor__id=id).order_by('-lecture__year','-written_datetime')
    if int(course_id) != -1:
        comments = comments.filter(lecture__course__id=course_id)
    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context),safe=False)


def SearchResultCourseView(request,id=-1,professor_id=-1):
    professor_id = int(professor_id)
    course = Course.objects.get(id=id)
    comments = Comment.objects.filter(course=course).order_by('-lecture__year','-written_datetime')
    if professor_id != -1:
        lectures = list(course.lecture_course.all())
        lec_by_prof = GetLecByProf(lectures)
        target_lectures = lec_by_prof[professor_id]
        comments = comments.filter(lecture__in=target_lectures)

    paginator = Paginator(comments,10)
    page_obj = paginator.page(1)
    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "result":SearchCourse(course,professor_id),
            "results": results,
            "page":page_obj.number,
    }
    return render(request, 'review/sresult.html', context)


def SearchResultCourseView_json(request, id=-1,professor_id=-1,page=-1):
    professor_id = int(professor_id)
    course = Course.objects.get(id=id)
    comments = Comment.objects.filter(course = course).order_by('-lecture__year','-written_datetime')
    if professor_id != -1:
        lectures = list(course.lecture_course.all())
        lec_by_prof = GetLecByProf(lectures)
        target_lectures = lec_by_prof[professor_id]
        comments = comments.filter(lecture__in=target_lectures)

    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context),safe=False)


@login_required(login_url='/session/login/')
def SearchUserComment_json(request, page=1):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    user_comments = Comment.objects.filter(writer=user_profile)

    paginator = Paginator(user_comments, 5)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise

    results = [SearchComment(request, i) for i in page_obj.object_list]

    context = {
        "results": results,
        "hasNext": page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context), safe=False)


# Review Control Function#############################################################################################
@login_required(login_url='/session/login/')
def ReviewDelete(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)

    lecture = user_profile.take_lecture_list.get(id=request.POST['lectureid'])
    target_comment = user_profile.comment_set.get(lecture=lecture);
    target_comment.u_delete()
    return HttpResponseRedirect('/review/insert/'+str(request.POST['lectureid'])+'/'+str(request.POST['semester']))


# @login_required
# login_required(login_url='/session/login/')
def ReviewLike(request):
    is_login = False
    already_up = False
    likes_count = -1
    comment_id = -1
    if request.user.is_authenticated():
        is_login = True
        if request.method == 'POST':
            user = request.user
            user_profile = UserProfile.objects.get(user=user)
            target_review = Comment.objects.get(id=request.POST['commentid']);
            if CommentVote.objects.filter(comment = target_review, userprofile = user_profile).exists():
                already_up = True
            else:
                CommentVote.cv_create(target_review,user_profile) #session 완성시 변경
                likes_count = target_review.like
    ctx = {'likes_count': likes_count, 'already_up': already_up, 'is_login':is_login, 'id': request.POST['commentid']}
    return JsonResponse(json.dumps(ctx),safe=False)


# ReviewWritingPage#################################################################################################
@login_required(login_url='/session/login/')
def ReviewPortal(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    user_profile.portal_check =1
    user_profile.save()
    return HttpResponseRedirect('https://sparcssso.kaist.ac.kr/account/profile/')


@login_required(login_url='/session/login/')
def ReviewInsertView(request,lecture_id=-1,semester=0):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    if user_profile.portal_check == 1:
        user_profile.portal_check =0
        user_profile.save()
        return HttpResponseRedirect('/session/logout/')
    semchar=[None,"봄","여름","가을","겨울"]
    reviewmsg=""
    return_object = []
    semester=int(semester)
    lec_year = (semester/10)+2000
    lec_sem = semester%10
    if len(user_profile.student_id) < 1:
        ctx = {'errttle':'포탈 연동이 되어있지 않습니다!','errmsg':'<a href="/review/portal/">포탈 연동하러가기!</a>'}
    else:
        ctx = {'errttle':'수강한 과목이 없습니다!','errmsg':'만약 수강한 과목이 있다면, <a href="/review/refresh/">여기를 눌러 갱신해주세요!</a>'}
    if semester % 10 > 4 or semester < 0 or semester > 1000:
        return render(request, 'review/error.html',ctx)
    lecture_list = user_profile.take_lecture_list.all()
    if len(lecture_list) == 0:
        print user_profile.student_id
        return render(request, 'review/error.html',ctx)
    recent_semester=0
    semesters=[]
    thissem_lec = -1
    for single_lecture in lecture_list:
        lecture_object = {}
        lecture_object["title"]=single_lecture.title;
        lecture_object["old_code"]=single_lecture.old_code;
        lecture_object["lecid"]=str(single_lecture.id);
        lecture_object["semester"]=single_lecture.semester;
        lecture_object["sem_char"]=semchar[lecture_object["semester"]]
        lecture_object["year"]=single_lecture.year;
        lecture_object["lectime"]=(lecture_object["year"]-2000)*10+lecture_object["semester"]
        try:
            lecture_object["comment"]=user_profile.comment_set.get(lecture=single_lecture).comment
        except:
            lecture_object["comment"]=""
        korstr = str((lecture_object["year"]%100))+lecture_object["sem_char"]
        if recent_semester < lecture_object["lectime"]:
            recent_semester = lecture_object["lectime"]
        if not (lecture_object["lectime"],korstr) in semesters:
            semesters.append((lecture_object["lectime"],korstr))
        prof_list = single_lecture.professor.all();
        lecture_object["professor"]=", ".join([i.professor_name for i in prof_list])
        if semester == lecture_object["lectime"]:
                if thissem_lec < 0: thissem_lec = lecture_object["lecid"]
                return_object.append(lecture_object)
    gradelist=['A','B','C','D','F']
    pre_comment =""
    pre_grade="A"
    pre_load="A"
    pre_speech="A"
    subjectname=""
    semesters.sort(reverse=True)
    if semester == 0:
        return HttpResponseRedirect("/review/insert/-1/"+ str(recent_semester))
    try:
        guideline="1) 학점, 로드 등의 평가에 대하여 왜 그렇게 평가를 했는지 간단히 서술해주세요.\nex) 진도를 빠르고 많이 나가는 경향이 있습니다 / 학점은 절대평가로 주셔서 열심히 공부하면 잘 나오는 것 같아요 / 과제는 6번 주어졌고, 각 과제마다 시간이 약 6 ~ 8 시간 소요된 것 같습니다.\n2) 최대한 본인의 감정을 배제해주시면 감사하겠습니다.\nex) 교수님이 저를 맘에 안 들어하시는 것 같아요 (X) / 시험기간에 플젝 내준건 좀 너무하다싶었음 (X)\n3) 나중에 이 수업을 들을 학생들을 위해 여러 조언들을 해주세요.\nex) 이 수업을 들으시려면 먼저 이산구조와 데이타구조를 먼저 듣고 오시는 것을 추천합니다. / 교수님이 수업하실 때 열심히 참여하시면 좋을 것 같아요."
    except:
        guideline="Guideline Loading Error..."
    if str(lecture_id)==str(-1) and semester > 0:
        if thissem_lec<0:
            return render(request, 'review/error.html',ctx)
        else:
            return HttpResponseRedirect('../../' + str(thissem_lec) + '/'+str(semester))
    if semester > 0:
        now_lecture = user_profile.take_lecture_list.get(id=lecture_id,year=lec_year,semester=lec_sem)
        try :
            subjectname = now_lecture.title
            temp = user_profile.comment_set.get(lecture=now_lecture)
            pre_comment = temp.comment
            pre_grade = gradelist[5-(temp.grade)]
            pre_load = gradelist[5-(temp.load)]
            pre_speech = gradelist[5-(temp.speech)]
            pre_like = temp.like
        except :
            pre_comment = ''
            pre_like = -1

    else:
        guideline="왼쪽 탭에서 과목을 선택해 주세요.\n"
    ctx ={
            'semester':str(semester),
            'lecture_id':str(lecture_id),
            'subjectname':subjectname,
            'reviewmsg':reviewmsg,
            'object':return_object,
            'comment':pre_comment,
            'gradelist': gradelist,
            'grade': pre_grade,
            'load':pre_load,
            'speech':pre_speech,
            'like':pre_like,
            'reviewguideline':guideline,
            'semesters':semesters,
        }
    return render(request, 'review/insert.html',ctx)


#ReviewAddingFunctionPage#######################################################################################
@login_required(login_url='/session/login/')
def ReviewInsertAdd(request,lecture_id,semester):
    if request.POST.has_key('content') == False:
        return HttpResponse('후기를 입력해주세요.')
    else:
        if len(request.POST['content']) == 0:
            return HttpResponse('1글자 이상 입력해주세요.')
        else:
            comment = request.POST['content']

    user = request.user
    user_profile = UserProfile.objects.get(user=user)

    lecid = int(lecture_id)
    lecture = user_profile.take_lecture_list.get(id = lecid) # 하나로 특정되지않음, 변경요망
    course = lecture.course
    comment = request.POST['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = 6-int(request.POST['gradescore'])
    if not 0<=grade<=5: grade=0
    load = 6-int(request.POST['loadscore'])
    if not 0<=load<=5: load=0
    speech = 6-int(request.POST['speechscore'])
    if not 0<=speech<=5: speech=0
    total = (grade+load+speech)/3.0
    writer = user_profile #session 완성시 변경

    try :
        target_comment = user_profile.comment_set.get(lecture=lecture)
        target_comment.u_update(grade=grade, load=load, speech=speech, comment=comment)
    except :
        Comment.u_create(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, writer=writer)
    return HttpResponseRedirect('../')


# ReviewRefreshFunctionPage#######################################################################################
@login_required(login_url='/session/login/')
def ReviewRefresh(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)
    student_id = user_profile.student_id
    if not student_id == '':
        if not settings.DEBUG:
            os.chdir('/var/www/otlplus/')
        os.system('python update_taken_lecture_user.py %s' % student_id)
    return HttpResponseRedirect('../insert')


def ReviewView(request, comment_id):
    try :
        comment = SearchComment(request,Comment.objects.get(id=comment_id))
        isExist = 1
    except :
        comment = ''
        isExist = 0

    return render(request, 'review/review_view.html',
                            {
                                'result': comment,
                                'isExist' : isExist,
                            })


def LastCommentView(request):

    if request.GET.getlist('filter') == ['F']:
        if request.user.is_authenticated():
            user_profile = UserProfile.objects.get(user=request.user)
            favorite_departments_code = []
            for department in user_profile.favorite_departments.all():
                favorite_departments_code.append(department.code)
            department_filters = DepartmentFilters(favorite_departments_code)
        else:
            department_filters = ["CE", "MSB", "MAE", "PH", "BiS", "IE", "ID", "BS", "CBE", "MAS", "MS", "NQE", "EE", "CS", "MAE", "CH"]
    else:
        department_filters = DepartmentFilters(request.GET.getlist('filter'))
    comments = Comment.objects.filter(course__department__code__in=department_filters).order_by('-written_datetime')

    paginator = Paginator(comments,10)
    page_obj = paginator.page(1)

    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "results": results,
            "page":page_obj.number,
    }
    return render(request, 'review/lastcomment.html', context)


def LastCommentView_json(request, page=-1):

    if request.GET.getlist('filter') == [u"F"]:
        if request.user.is_authenticated():
            user_profile = UserProfile.objects.get(user=request.user)
            favorite_departments_code = []
            for department in user_profile.favorite_departments.all():
                favorite_departments_code.append(department.code)
            department_filters = DepartmentFilters(favorite_departments_code)
        else:
            department_filters = []
    else:
        department_filters = DepartmentFilters(request.GET.getlist('filter'))
    comments = Comment.objects.filter(course__department__code__in=department_filters).order_by('-written_datetime')

    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = [SearchComment(request,i) for i in page_obj.object_list]

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
            "is_login":request.user.is_authenticated(),
    }
    return JsonResponse(json.dumps(context),safe=False)


# 404 ERROR HANDLING
def page_not_found(request):
    response = render(
        request,'review/404.html')

    response.status_code = 404

    return response


# 400 ERROR HANDLING
def bad_request(request):
    response = render_to_response(
        'review/400.html',
        context_instance=RequestContext(request)
    )

    response.status_code = 400

    return response


# 403 ERROR HANDLING
def permisson_denied(request):
    response = render_to_response(
        'review/403.html',
        context_instance=RequestContext(request)
    )

    response.status_code = 403

    return response


# 500 ERROR HANDLING
def server_error(request):
    response = render(
        request,'review/500.html')

    response.status_code = 500

    return response


def licenses(request):
    return render(request, 'licenses.html')


def credits(request):
    return render(request, 'credits.html')


def dictionary(request, course_code):
    courses = Course.objects.filter(old_code = str(course_code))
    if len(courses)>0:
        return HttpResponseRedirect('/review/result/course/'+str(courses[0].id))
    raise Http404

