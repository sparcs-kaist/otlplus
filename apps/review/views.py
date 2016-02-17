# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, CourseFiltered, Professor
from apps.review.models import Comment, MajorBestComment, LiberalBestComment
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db.models import Q
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from math import exp
from itertools import groupby
#test
from django.core.paginator import Paginator, InvalidPage
from django.core import serializers
import json
#testend
import random


#Filter Functions################################################################
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
    sid_var = "20150390"
    sid_default = "00000000"
    user = UserProfile.objects.get(student_id=sid_var)

    comment_liberal = list(LiberalBestComment.objects.all())
    comment_major = list(MajorBestComment.objects.all())

    liberal_comment = []
    major_comment = []

    for i in range(3):
        try :
            j = random.randint(0, len(comment_liberal)-1)
            comment = comment_liberal[j].comment
            professors = comment.lecture.professor.all()
            professor_name = " " + " ".join([i.professor_name for i in professors]) + " "
            context = {
                "type":"comment",
                "id":comment.id,
                "lecture_title":comment.lecture.title,
                "lecture_year":comment.lecture.year,
                "professor_name":professor_name,
                "writer":comment.writer_label, 
                "comment":comment.comment,
                "like":comment.like,
                "score":{"grade":comment.grade, "load":comment.load, "speech":comment.speech, "total":comment.total,},
                "gradelist": [(-1,'?'),(0,'F'),(1,'D'),(2,'C'),(3,'B'),(4,'A')],
            }
            liberal_comment.append(context)
            comment_liberal.pop(j)

        except Exception, e:
            print e
            pass

    for i in range(3):
        try:
            j = random.randint(0,len(comment_major)-1)


            comment = comment_major[j].comment
            professors = comment.lecture.professor.all()
            professor_name = " " + " ".join([i.professor_name for i in professors]) + " "
            context = {
                "type":"comment",
                "id":comment.id,
                "lecture_title":comment.lecture.title,
                "lecture_year":comment.lecture.year,
                "professor_name":professor_name,
                "writer":comment.writer_label, 
                "comment":comment.comment,
                "like":comment.like,
                "score":{"grade":comment.grade, "load":comment.load, "speech":comment.speech, "total":comment.total,},
                "gradelist": [(-1,'?'),(0,'F'),(1,'D'),(2,'C'),(3,'B'),(4,'A')],
            }
            major_comment.append(context)
            comment_major.pop(j)

        except Exception, e:
            print e
            pass

    ctx = {'liberal_comment':liberal_comment, 'major_comment':major_comment}

    return render(request, 'review/search.html',ctx)
#####################################################################################################


def isKorean(word):
    if len(word) <= 0:
        return False
    # UNICODE RANGE OF KOREAN: 0xAC00 ~ 0xD7A3
    for c in range(len(word)):
        if word[c] < u"\uac00" or word[c] > u"\ud7a3":
            return False
    return True

def GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword):
    if len(semester_filters)==0 or ("ALL" in semester_filters):
        courses = Course.objects.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)
    else :
        courses = CourseFiltered.objects.get(title=semester_filters[0]).courses.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)

    if len(keyword)>0:
        courses = courses.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__icontains=keyword) | Q(department__name__icontains=keyword) | Q(department__name_en__icontains=keyword))

    return courses

def KeyLecByProf(lecture):
    return sorted([i.id for i in lecture.professor.all()])

def GetLecByProf(lectures):
    lectures.sort(key = KeyLecByProf)
    lec_by_prof = groupby(lectures, KeyLecByProf)
    lec_by_prof = [ list(i[1]) for i in lec_by_prof ]
    return lec_by_prof

def SearchCourse(courses):
    results = []
    for course in courses:
        lecture_list=[]
        for lecture in course.lecture_course.all():
            professors = lecture.professor.all()
            professor_name = " " + " ".join([i.professor_name for i in professors]) + " "
            lecture_list.append({
                "id" : lecture.id,
                "professor_name" : professor_name
            })      # 수정 예정
        
        lectures = list( course.lecture_course.all() )
        lec_by_prof = GetLecByProf(lectures)
        prof_info = []
        for lectures in lec_by_prof:
            names = [i.professor_name for i in lectures[0].professor.all()]
            if len(names) == 1:
                name_string = names[0]
            elif len(names) == 2:
                name_string = names[0] + ', ' + names[1]
            elif len(names) > 2:
                name_string = names[0] + u' 외 %d명'%(len(names)-1)
            else:
                name_string = 'error'
            prof_info.append({
                "name" : name_string
            })

        comment_num = course.comment_num
        grade = 0.0
        load = 0.0
        speech = 0.0
        total = 0.0
        if comment_num != 0:
            grade = float(course.grade_sum) / comment_num
            load = float(course.load_sum) / comment_num
            speech = float(course.speech_sum) / comment_num
            total = float(course.total_sum) / comment_num

        results.append({
            "type":"course",
            "id":course.id,
            "title":course.title,
            "lecture_list":lecture_list,
            "score":{"grade":grade, "load":load, "speech":speech, "total":total,},
            "prof_info":prof_info,
        })
    return results

def SearchComment(comments):
    results = []
    for comment in comments:
        professors = comment.lecture.professor.all()
        professor_name = " " + " ".join([i.professor_name for i in professors]) + " "
        results.append({
            "type":"comment",
            "id":comment.id,
            "lecture_title":comment.lecture.title,
            "lecture_year":comment.lecture.year,
            "professor_name":professor_name,
            "writer":comment.writer_label, 
            "comment":comment.comment,
            "like":comment.like,
            "score":{"grade":comment.grade, "load":comment.load, "speech":comment.speech, "total":comment.total,},
            "gradelist": [(-1,'?'),(0,'F'),(1,'D'),(2,'C'),(3,'B'),(4,'A')],
        })
    return results


def SearchProfessor(professor):
    lecture_list=[]
    for lecture in professor.lecture_professor.all():
        lecture_list.append({
            "id" : lecture.id,
            "title" : lecture.title,
            "old_code" : lecture.old_code,
        })
    comment_num = professor.comment_num
    grade = 0.0
    load = 0.0
    speech = 0.0
    total = 0.0
    if comment_num != 0:
        grade = float(professor.grade_sum) / comment_num
        load = float(professor.load_sum) / comment_num
        speech = float(professor.speech_sum) / comment_num
        total = float(professor.total_sum) / comment_num
    result={
        "type":"professor",
        "id":professor.id,
        "professor_name":professor.professor_name,
        "lecture_list":lecture_list,
        "score":{"grade":grade, "load":load, "speech":speech, "total":total,},

    }
    return result

def Expectations(keyword):
    if not keyword :
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
    

#MainPage#################################################################################################
def SearchResultView(request):
    if 'q' in request.GET :
        keyword = request.GET['q']
    else :
        keyword = ""

    if Course.objects.filter(title__iexact=keyword).exists():
        return HttpResponseRedirect('/review/result/course/'+str(Course.objects.filter(title__iexact=keyword)[0].id))
    elif Course.objects.filter(title_en__iexact=keyword).exists():
        return HttpResponseRedirect('/review/result/course/'+str(Course.objects.filter(title_en__iexact=keyword)[0].id))
    elif Course.objects.filter(old_code__iexact=keyword).exists():
        return HttpResponseRedirect('/review/result/course/'+str(Course.objects.filter(old_code__iexact=keyword)[0].id))
    elif Professor.objects.filter(professor_name__iexact=keyword).exists():
        return HttpResponseRedirect('/review/result/professor/'+str(Professor.objects.filter(professor_name__iexact=keyword)[0].id))
    elif Professor.objects.filter(professor_name_en__iexact=keyword).exists():
        return HttpResponseRedirect('/review/result/professor/'+str(Professor.objects.filter(professor_name_en__iexact=keyword)[0].id))
    else:
        semester_filters = request.GET.getlist('semester')
        department_filters = DepartmentFilters(request.GET.getlist('department'))
        type_filters = TypeFilters(request.GET.getlist('type'))
        grade_filters = GradeFilters(request.GET.getlist('grade'))
        courses = GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)

        if 'sort' in request.GET :
            if request.GET['sort']=='name':
                courses = courses.order_by('title','old_code')
            elif request.GET['sort']=='total':
                courses = courses.order_by('total','old_code')
            elif request.GET['sort']=='grade':
                courses = courses.order_by('grade','old_code')
            elif request.GET['sort']=='load':
                courses = courses.order_by('load','old_code')
            elif request.GET['sort']=='speech':
                courses = courses.order_by('speech','old_code')
            else:
                courses = courses.order_by('old_code')
        else :
            courses = courses.order_by('old_code')

        if len(keyword)>0:
            expectations = Professor.objects.filter(Q(professor_name__icontains=keyword)|Q(professor_name_en__icontains=keyword))
            expectations = [{"name":i.professor_name,"id":i.id} for i in expectations]
        else:
            expectations = []

        paginator = Paginator(courses,10)
        page_obj = paginator.page(1)

        results = SearchCourse(page_obj.object_list)

        print "result_num :", (len(courses))
        print "NextPage :", page_obj.has_next(), page_obj

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
            courses = courses.order_by('total','old_code')
        elif request.GET['sort']=='grade':
            courses = courses.order_by('grade','old_code')
        elif request.GET['sort']=='load':
            courses = courses.order_by('load','old_code')
        elif request.GET['sort']=='speech':
            courses = courses.order_by('speech','old_code')
        else:
            courses = courses.order_by('old_code')
    else :
        courses = courses.order_by('old_code')

    paginator = Paginator(courses,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404

    results = SearchCourse(page_obj.object_list)

    print "NextPage :", page_obj.has_next(), page_obj

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
            "keyword":keyword,
    }
    return JsonResponse(json.dumps(context),safe=False)

def SearchResultProfessorView(request,id=-1):
    professor = Professor.objects.get(id=id)
    comments = Comment.objects.filter(lecture__professor__id=id)
    paginator = Paginator(comments,10)
    page_obj = paginator.page(1)
    results = SearchComment(page_obj.object_list)

    print "result_num :", (len(comments))
    print "NextPage :", page_obj.has_next(), page_obj

    context = {
            "result":SearchProfessor(professor),
            "results": results,
            "page":page_obj.number,
    }
    return render(request, 'review/sresult.html', context)

def SearchResultProfessorView_json(request, id,page):
    comments = Comment.objects.filter(lecture__professor__id=id)
    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = SearchComment(page_obj.object_list)

    print "NextPage :", page_obj.has_next(), page_obj

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context),safe=False)


def SearchResultCourseView(request,id=-1):
    course = [Course.objects.get(id=id)]
    comments = Comment.objects.filter(course__id=id)

    paginator = Paginator(comments,10)
    page_obj = paginator.page(1)
    results = SearchComment(page_obj.object_list)

    print "result_num :", (len(comments))
    print "NextPage :", page_obj.has_next(), page_obj

    context = {
            "result":SearchCourse(course)[0],
            "results": results,
            "page":page_obj.number,
    }
    return render(request, 'review/sresult.html', context)

def SearchResultCourseView_json(request, id,page):
    comments = Comment.objects.filter(course__id=id)
    paginator = Paginator(comments,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    results = SearchComment(page_obj.object_list)

    print "NextPage :", page_obj.has_next(), page_obj

    context = {
            "results":results,
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context),safe=False)


#Review Control Function#############################################################################################
def ReviewDelete(request):
    user = UserProfile.objects.get(student_id=request.POST['sid'])
    lecture = user.take_lecture_list.get(id=request.POST['lectureid'])
    target_comment = user.comment_set.get(lecture=lecture);
    target_comment.u_delete()
    return HttpResponseRedirect('/review/insert/'+str(request.POST['lectureid'])+'/'+str(request.POST['semester']))

def ReviewLike(request):
    target_review = Comment.objects.get(writer=request.POST['writer'],lecture=Lecture.objects.get(old_code=request.POST['lecturechoice']));
    target_review.like += 1;
    sid_var = "20150390"
    user = UserProfile.objects.get(student_id=sid_var)
    comment_vote=CommentVote(userprofile=user,comment=target_review.comment) #session 완성시 변경
    comment_vote.is_up =  True;
    target_review.save()
    comment_vote.save()
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

#ReviewWritingPage#################################################################################################

def ReviewInsertView(request,lecture_id=-1,semester=0):
    sid_var = "20150390"
    semchar=[None,"봄","여름","가을","겨울"]
    reviewmsg=""
    user=UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
    return_object = []
    semester=int(semester)
    lec_year = (semester/10)+2000
    lec_sem = semester%10
    if semester % 10 > 4 or semester < 0 or semester > 1000:
        return HttpResponseRedirect('../0')
    if semester == 0:
        lecture_list = user.take_lecture_list.all()
    else:
        lecture_list = user.take_lecture_list.filter(year=lec_year,semester=lec_sem)
    if len(lecture_list) == 0:
        if semester == 0:
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
        else:
            lecture_list = user.take_lecture_list.all()
            reviewmsg = "<strong>에러!</strong> 원하시는 학기 또는 강의가 존재하지 않습니다"
            lecture_id,semester=-1,0

    for single_lecture in lecture_list:
        lecture_object = {}
        lecture_object["title"]=single_lecture.title;
        lecture_object["old_code"]=single_lecture.old_code;
        lecture_object["lecid"]=str(single_lecture.id);
        lecture_object["semester"]=single_lecture.semester;
        lecture_object["sem_char"]=semchar[lecture_object["semester"]]
        lecture_object["year"]=single_lecture.year;
        lecture_object["lectime"]=(lecture_object["year"]-2000)*10+lecture_object["semester"]
        prof_list = single_lecture.professor.all();
        lecture_object["professor"]=", ".join([i.professor_name for i in prof_list])
        return_object.append(lecture_object)
    gradelist=['A','B','C','D','F']
    pre_comment =""
    pre_grade="A"
    pre_load="A"
    pre_speech="A"
    subjectname=""
    try:
        guideline="".join(open("apps/review/guideline","r").readlines())
    except:
        guideline="Guideline Loading Error..."
    if str(lecture_id)==str(-1) and semester > 0:
        return HttpResponseRedirect('../../' + str(lecture_list[0].id) + '/'+str(return_object[0]["lectime"]))
    if semester > 0:
        now_lecture = user.take_lecture_list.get(id=lecture_id,year=lec_year,semester=lec_sem)
        try :
            subjectname = now_lecture.title
            temp = user.comment_set.all()
            temp = temp.get(lecture=now_lecture)
            pre_comment = temp.comment
            pre_grade = gradelist[4-(temp.grade)]
            pre_load = gradelist[4-(temp.load)]
            pre_speech = gradelist[4-(temp.speech)]
        except : pre_comment = ''
    else:
        guideline="왼쪽 탭에서 과목을 선택해 주세요.\n"
    ctx = {'semester':str(semester), 'lecture_id':str(lecture_id), 'subjectname':subjectname, 'reviewmsg':reviewmsg, 'object':return_object, 'comment':pre_comment, 'gradelist': gradelist,'grade': pre_grade,'load':pre_load,'speech':pre_speech, 'sid':sid_var, 'reviewguideline':guideline }
    return render(request, 'review/insert.html',ctx)


#ReviewAddingFunctionPage#######################################################################################
def ReviewInsertAdd(request,lecture_id,semester):
#    if request.POST.has_key('content') == False:
 #       return HttpResponse('후기를 입력해주세요.')
  #  else:
  #      if len(request.POST['content'])==0:
   #         return HttpResponse('1글자 이상 입력해주세요.')
   #     else:
#	    comment=request.POST['content']
    sid_var = "20150390"
    lecid = int(lecture_id)
    user = UserProfile.objects.get(student_id=sid_var) #session 완성시 변경

    lecture = user.take_lecture_list.get(id = lecid) # 하나로 특정되지않음, 변경요망
    course = lecture.course
    comment = request.POST['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = 5-int(request.POST['gradescore'])
    load = 5-int(request.POST['loadscore'])
    speech = 5-int(request.POST['speechscore'])
    total = (grade+load+speech+2)//3 #현재 float 불가
    writer = user #session 완성시 변경
    try :
        target_comment = user.comment_set.get(lecture=lecture)
        target_comment.u_update(grade=grade, load=load, speech=speech, total=total, comment=comment)
    except :
        Comment.u_create(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, total=total, writer=writer)
    return HttpResponseRedirect('../')

def ReviewView(request, comment_id):
    try :
        comment = Comment.objects.get(id=comment_id)
        isExist = 1
        print type(comment)
    except :
        comment = ''
        isExist = 0

    return render(request, 'review/review_view.html',
                            {
                                'comment': comment,
                                'isExist' : isExist,
                            })

