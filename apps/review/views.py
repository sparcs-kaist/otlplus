# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture, Department
from apps.review.models import Comment
from django.http import HttpResponse, HttpResponseRedirect
from django.db.models import Q

def SearchView(request):
    return render(request, 'review/search/search.html')

def SearchResultView(request):
    by_professor = False    #나중에 변경
    
    courses = Course.objects.all()

    no_department_selected = True
    temp_courses = courses[:]
    for department in Department.objects.all():
        if not(department.code in request.GET):
            courses = courses.exclude(department=department)
        else:
            no_department_selected = False
    if no_department_selected:
        courses = temp_courses

    no_course_type_selected = True
    temp_courses = courses[:]
    course_types = ['BR', 'BE', 'MR', 'ME', 'MGC', 'HSE']
    for course_type in course_types:
        if not(course_type in request.GET):
            courses = courses.exclude(type=course_type)
        else:
            no_course_type_selected = False
    if no_course_type_selected:
        courses = temp_courses

    results=[]
    if by_professor:
        for course in courses:
            for professor in course.professors.all():
                grade = 0
                load = 0
                speech = 0
                total = 0
                comment_num = 0
                lectures = Lecture.objects.filter(Q(course=course) & Q(professor=professor))
                for lecture in lectures:
                    grade += lecture.grade_sum
                    load += lecture.load_sum
                    speech += lecture.speech_sum
                    total += lecture.total_sum
                    comment_num += lecture.comment_num
                if comment_num != 0:
                    grade = float(grade)/comment_num
                    load = float(load)/comment_num
                    speech = float(speech)/comment_num
                    total = float(total)/comment_num
                results.append([[course, professor], [grade, load, speech, total], comment_num])
    else:
        for course in courses:
            grade = 0
            load = 0
            speech = 0
            total = 0
            comment_num = 0
            lectures = Lecture.objects.filter(course=course)
            for lecture in lectures:
                grade += lecture.grade_sum
                load += lecture.load_sum
                speech += lecture.speech_sum
                total += lecture.total_sum
                comment_num += lecture.comment_num
            if comment_num != 0:
                grade = float(grade)/comment_num
                load = float(load)/comment_num
                speech = float(speech)/comment_num
                total = float(total)/comment_num
            results.append([[course, None], [grade, load, speech, total], comment_num])

    return render(request, 'review/search/result.html', {'results':results})

def ReviewDelete(request):
    user = UserProfile.objects.get(student_id=request.POST['sid'])
    lec = Lecture.objects.get(id=request.POST['lectureid'])
    target = Comment.objects.get(writer=user,lecture=lec);
    lec.grade_sum -= target.grade
    lec.load_sum -= target.load
    lec.speech_sum -= target.speech
    lec.total_sum -= target.total
    target.delete()
    lec.save()
    return HttpResponseRedirect('/review/review/insert/'+str(request.POST['lectureid']))

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
    if lecture_id==-1:
        return HttpResponseRedirect('./' + str(lecture_list[0].id) )    
    now_lecture = Lecture.objects.get(id=lecture_id)
    try : 
        temp = Comment.objects.filter(writer=user)
        temp = temp.get(lecture=now_lecture)
        pre_comment = temp.comment
        pre_grade = gradelist[4-(temp.grade)]
        pre_load = gradelist[4-(temp.load)]
        pre_speech = gradelist[4-(temp.speech)]
    except : pre_comment = ''
    ctx = {'lecture_id':str(lecture_id), 'object':return_object, 'comment':pre_comment, 'gradelist': gradelist,'grade': pre_grade,'load':pre_load,'speech':pre_speech, 'sid':sid_var }
    return render(request, 'review/review/insert.html',ctx)

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
    lecture = Lecture.objects.get(id = lecid) # 하나로 특정되지않음, 변경요망
    course = Course.objects.get(old_code=lecture.old_code)
    comment = request.POST['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = 5-int(request.POST['gradescore'])
    load = 5-int(request.POST['loadscore'])
    speech = 5-int(request.POST['speechscore'])
    total = grade+load+speech #현재 float 불가
    writer = UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
    try :
        temp = Comment.objects.filter(writer=writer)
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
