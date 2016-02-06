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
    gradelist=[(-1,'?'),(0,'F'),(1,'D'),(2,'C'),(3,'B'),(4,'A')]

    for i in range(3):
        try :
            j = random.randint(0, len(comment_liberal)-1)
            liberal_comment.append(comment_liberal[j].comment)
            comment_liberal.pop(j)

        except Exception, e:
            print e
            pass

    for i in range(3):
        try:
            j = random.randint(0,len(comment_major)-1)
            major_comment.append(comment_major[j].comment)
            comment_major.pop(j)

        except Exception, e:
            print e
            pass
    ctx = {'liberal_comment':liberal_comment, 'major_comment':major_comment, 'gradelist':gradelist}

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

def GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword=""):

    if len(semester_filters)==0 or ("ALL" in semester_filters):
        courses = Course.objects.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)
    else :
        courses = CourseFiltered.objects.get(title=semester_filters[0]).courses.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)

    #keyword search
    if len(keyword)>0:
        courses = courses.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__icontains=keyword) | Q(department__name__icontains=keyword) | Q(department__name_en__icontains=keyword) | Q(professors__professor_name__icontains=keyword) | Q(professors__professor_name_en__icontains=keyword))
        print "keyword :",keyword
    return courses

def SearchCourse(courses):
    results = []
    for course in courses:
        lecture_list=[]
        for lecture in course.lecture_course.all():
            professor_name = " "
            for professor in lecture.professor.all():
                professor_name+=professor.professor_name + " "
            lecture_list.append({
                "id" : lecture.id,
                "professor_name" : professor_name
            })
        grade = 0
        load = 0
        speech = 0
        total = 0
        comment_num = course.comment_num

        if comment_num !=0:
            grade = course.grade_sum/comment_num
            load = course.load_sum/comment_num
            speech = course.speech_sum/comment_num
            total = course.total_sum/comment_num

        results.append({
            "id":course.id,
            "title":course.title,
            "lecture_list":lecture_list,
            "score":{"grade":grade, "load":load, "speech":speech, "total":total,},

        })
    return results
def SearchComment(comments):
    pass
def SearchProfessor(professors):
    pass

#MainPage#################################################################################################
def SearchResultView(request):

    #filter search
    semester_filters = request.GET.getlist('semester')
    department_filters = DepartmentFilters(request.GET.getlist('department'))
    type_filters = TypeFilters(request.GET.getlist('type'))
    grade_filters = GradeFilters(request.GET.getlist('grade'))
    if 'q' in request.GET :
        keyword = request.GET['q']
    else :
        keyword = ""
    courses = GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)

    expectations=[]
    if len(keyword)>0 :
        expect_prof = Professor.objects.filter(Q(professor_name__icontains=keyword) | Q(professor_name_en__icontains=keyword))
        expect_course += Course.objects.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword))
        expect_temp=[]
        if isKorean(keyword):
            for profobj in expect_prof:
                expect_temp.append(profobj.professor_name)
            for courseobj in expect_courseobj:
                expect_temp.append(courseobj.title)
        else:
            for profobj in expect_prof:
                expect_temp.append(profobj.professor_name_en)
            for couseobj in expect_courseobj:
                expect_temp.append(courseobj.title_en)
        expectations = expect_temp
    else :
        pass
    paginator = Paginator(courses,10)
    page_obj = paginator.page(1)

    print "result_num :", (len(courses))
    print "NextPage :", page_obj.has_next(), page_obj
    context = {
            "results": SearchCourse(page_obj.object_list),
            "page":page_obj.number,
            "expectations":expectations,
    }
    return render(request, 'review/result.html', context)

def SearchResultView_json(request, page):
    semester_filters = request.GET.getlist('semester')
    department_filters = DepartmentFilters(request.GET.getlist('department'))
    type_filters = TypeFilters(request.GET.getlist('type'))
    grade_filters = GradeFilters(request.GET.getlist('grade'))
    if 'q' in request.GET :
        keyword = request.GET['q']
    else :
        keyword = ""
    courses = GetFilteredCourses(semester_filters, department_filters, type_filters, grade_filters, keyword)
    paginator = Paginator(courses,10)
    try:
        page_obj = paginator.page(page)
    except InvalidPage:
        raise Http404
    print "NextPage :", page_obj.has_next(), page_obj
    context = {
            "results":SearchCourse(page_obj.object_list),
            "hasNext":page_obj.has_next(),
    }
    return JsonResponse(json.dumps(context),safe=False)

#Review Control Function#############################################################################################
def ReviewDelete(request):
    user = UserProfile.objects.get(student_id=request.POST['sid'])
    lec = user.take_lecture_list.get(id=request.POST['lectureid'])
    target = user.comment_set.get(lecture=lec);
    lec.grade_sum -= target.grade
    lec.load_sum -= target.load
    lec.speech_sum -= target.speech
    lec.total_sum -= target.total
    target.delete()
    lec.save()
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
            return HttpResponseRedirect('../0')

    for single_lecture in lecture_list:
        lecture_object = {}
        lecture_object["title"]=single_lecture.title;
        lecture_object["old_code"]=single_lecture.old_code;
        lecture_object["lecid"]=str(single_lecture.id);
        lecture_object["semester"]=single_lecture.semester;
        lecture_object["sem_char"]=semchar[lecture_object["semester"]]
        lecture_object["year"]=single_lecture.year;
        lecture_object["lectime"]=(lecture_object["year"]-2000)*10+lecture_object["semester"]
        professor_str="";
        prof_list = single_lecture.professor.all();
        for single_prof_index in range(len(prof_list)):
            professor_str = professor_str + prof_list[single_prof_index].professor_name
            if(single_prof_index+1<len(prof_list)):
                professor_str = professor_str + ", "
        lecture_object["professor"]=professor_str
        return_object.append(lecture_object)
    gradelist=['A','B','C','D','F']
    pre_comment =""
    pre_grade="A"
    pre_load="A"
    pre_speech="A"
    guideline="".join(open("apps/review/guideline","r").readlines())
    if str(lecture_id)==str(-1) and semester > 0:
        return HttpResponseRedirect('../../' + str(lecture_list[0].id) + '/'+str(return_object[0]["lectime"]))
    if semester > 0:
        now_lecture = user.take_lecture_list.get(id=lecture_id,year=lec_year,semester=lec_sem)
        try :
            temp = user.comment_set.all()
            temp = temp.get(lecture=now_lecture)
            pre_comment = temp.comment
            pre_grade = gradelist[4-(temp.grade)]
            pre_load = gradelist[4-(temp.load)]
            pre_speech = gradelist[4-(temp.speech)]
        except : pre_comment = ''
    else:
        guideline="왼쪽 탭에서 과목을 선택해 주세요.\n"
    ctx = {'semester':str(semester), 'lecture_id':str(lecture_id), 'object':return_object, 'comment':pre_comment, 'gradelist': gradelist,'grade': pre_grade,'load':pre_load,'speech':pre_speech, 'sid':sid_var, 'reviewguideline':guideline }
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
        temp = user.comment_set.all()
        temp = temp.get(lecture=lecture)
        change_before_grade = temp.grade;
        change_before_load = temp.load;
        change_before_speech = temp.speech;
        change_before_total = temp.total;
        temp.comment = comment
        temp.grade = grade
        temp.load = load
        temp.speech = speech
        temp.total = total
        lecture.grade_sum += (grade-change_before_grade);
        lecture.load_sum += (load-change_before_load);
        lecture.speech_sum += (speech-change_before_speech);
        lecture.total_sum += (total-change_before_total);
        lecture.save()
        temp.save()
    except :
        new_comment = Comment(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, total=total, writer=writer)
        new_comment.save()
        lecture.grade_sum += grade;
        lecture.load_sum += load;
        lecture.speech_sum += speech;
        lecture.total_sum += total;
        lecture.save()
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

