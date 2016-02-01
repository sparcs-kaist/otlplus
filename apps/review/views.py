# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department, CourseFiltered, Professor
from apps.review.models import Comment, MajorBestComment, LiberalBestComment
from django.http import HttpResponse, HttpResponseRedirect
from django.db.models import Q
from datetime import datetime, timedelta, time, date
from django.utils import timezone
from math import exp
import random



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

def isKorean(word):
    if len(word) <= 0:
        return False
    # UNICODE RANGE OF KOREAN: 0xAC00 ~ 0xD7A3
    for c in range(len(word)):
        if word[c] < u"\uac00" or word[c] > u"\ud7a3":
            return False
    return True


def SearchResultView(request):
    if 'by_professor' in request.GET:
        by_professor = True
    else:
        by_professor = False

    semester_filters = request.GET.getlist('semester')
    department_filters = DepartmentFilters(request.GET.getlist('department'))
    type_filters = TypeFilters(request.GET.getlist('type'))
    grade_filters = GradeFilters(request.GET.getlist('grade'))
    print "semesterF :", semester_filters
    print "departmentF :", department_filters
    print "typeF :", type_filters
    print "gradeF :", grade_filters
    if len(semester_filters)==0 or ("ALL" in semester_filters):
        courses = Course.objects.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)
    else :
        courses = CourseFiltered.objects.get(title=semester_filters[0]).courses.filter(department__code__in=department_filters, type_en__in=type_filters, code_num__in=grade_filters)

    if ('q' in request.GET) and len(request.GET['q'])>0:
        keyword = request.GET['q']
        courses = courses.filter(Q(title__icontains=keyword) | Q(title_en__icontains=keyword) | Q(old_code__icontains=keyword) | Q(department__name__icontains=keyword) | Q(department__name_en__icontains=keyword) | Q(professors__professor_name__icontains=keyword) | Q(professors__professor_name_en__icontains=keyword))
        print "keyword :",keyword
    if len(request.GET['q'])>0 :
        expectations = Professor.objects.filter(Q(professor_name__icontains=keyword) | Q(professor_name_en__icontains=keyword))
        expect_temp=[]
        if isKorean(keyword):
            for profobj in expectations:
                expect_temp.append(profobj.professor_name)
        else:
            for profobj in expectations:
                expect_temp.append(profobj.professor_name_en)
        expectations = expect_temp
    else :
        expectations = []

    print "result_num :", (len(courses))

    results = []
    id = 0
    for course in courses:
        if by_professor:
            professors = course.professors.all()
        else:
            professors = [None]
        for professor in professors:
            comments = []
            grade = 0
            load = 0
            speech = 0
            total = 0
            comment_num = 0
            if by_professor:
                lectures = Lecture.objects.filter(Q(course=course) & Q(professor=professor))
            else:
                lectures = Lecture.objects.filter(course=course)
            for lecture in lectures:
                grade += lecture.grade_sum
                load += lecture.load_sum
                speech += lecture.speech_sum
                total += lecture.total_sum
                comment_num += lecture.comment_num
                comments.extend(Comment.objects.filter(lecture=lecture))
            if comment_num != 0:
                grade = float(grade)/comment_num
                load = float(load)/comment_num
                speech = float(speech)/comment_num
                total = float(total)/comment_num
            id += 1
            results.append([[course, professor], [grade, load, speech, total], comment_num, str(id), comments])

    def getgrade(item):
        return item[1][0]
    def getload(item):
        return item[1][1]
    def getspeech(item):
        return item[1][2]
    def gettotal(item):
        return item[1][3]
    results_grade=sorted(results,key=getgrade,reverse=True)
    results_load=sorted(results,key=getload,reverse=True)
    results_speech=sorted(results,key=getspeech,reverse=True)
    results_total=sorted(results,key=gettotal,reverse=True)
    return render(request, 'review/result.html', {'results':results, 'results_grade':results_grade, 'results_load':results_load, 'results_speech':results_speech, 'results_total':results_total, 'gets':dict(request.GET.iterlists()), 'expectations':expectations})



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
    return HttpResponseRedirect('/review/insert/'+str(request.POST['lectureid']))



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

def ReviewInsertView(request,lecture_id=-1):
    sid_var = "20150390"
    user=UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
    return_object = []
    lecture_list = user.take_lecture_list.all()
    if len(lecture_list) == 0:
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

    for single_lecture in lecture_list:
        lecture_object = {}
        lecture_object["title"]=single_lecture.title;
        lecture_object["old_code"]=single_lecture.old_code;
        lecture_object["lecid"]=str(single_lecture.id);
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
    guideline="1) 학점, 로드 등의 평가에 대하여 왜 그렇게 평가를 했는지 간단히 서술해주세요.\n"
    guideline=guideline+"진도를 빠르고 많이 나가는 경향이 있습니다 / 학점은 절대평가로 주셔서 열심히 공부하면 잘 나오는 것 같아요 / 과제는 6번 주어졌고, 각 과제마다 시간이 약 6 ~ 8 시간 소요된 것 같습니다.\n"
    guideline=guideline+"2) 최대한 본인의 감정을 배제해주시면 감사하겠습니다.\n"
    guideline=guideline+"ex) 교수님이 저를 맘에 안 들어하시는 것 같아요 (X) / 시험기간에 플젝 내준건 좀 너무하다싶었음 (X)\n"
    guideline=guideline+"3) 나중에 이 수업을 들을 학생들을 위해 여러 조언들을 해 주세요.\n"
    guideline=guideline+"ex) 이 수업을 들으시려면 먼저 이산구조와 데이타구조를 먼저 듣고 오시는 것을 추천합니다. / 교수님이 수업하실 때 열심히 참여하시면 좋을 것 같아요."
    if lecture_id==-1:
        return HttpResponseRedirect('./' + str(lecture_list[0].id) )
    now_lecture = user.take_lecture_list.get(id=lecture_id)
    try :
        temp = user.comment_set.all()
        temp = temp.get(lecture=now_lecture)
        pre_comment = temp.comment
        pre_grade = gradelist[4-(temp.grade)]
        pre_load = gradelist[4-(temp.load)]
        pre_speech = gradelist[4-(temp.speech)]
    except : pre_comment = ''
    ctx = {'lecture_id':str(lecture_id), 'object':return_object, 'comment':pre_comment, 'gradelist': gradelist,'grade': pre_grade,'load':pre_load,'speech':pre_speech, 'sid':sid_var, 'reviewguideline':guideline }
    return render(request, 'review/insert.html',ctx)



def ReviewInsertAdd(request,lecture_id):
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

