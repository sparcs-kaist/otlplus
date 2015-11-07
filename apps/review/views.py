# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture
from apps.review.models import Comment
from django.http import HttpResponse, HttpResponseRedirect

def SearchView(request):
    return render(request, 'review/search/search.html')

def SearchResultView(request):
    by_professor = False     #나중에 변경
    results = []
    ###### 이 부분에 검색 구현 ######
    courses = Course.objects.all()
    #################################
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
                    total += lecture.speech_sum
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
                total += lecture.speech_sum
                comment_num += lecture.comment_num
            if comment_num != 0:
                grade = float(grade)/comment_num
                load = float(load)/comment_num
                speech = float(speech)/comment_num
                total = float(total)/comment_num
            results.append([[course, None], [grade, load, speech, total], comment_num])
    return render(request, 'review/search/result.html', {'results':results})

def ReviewDelete(request):
    target_review = Comment.objects.get(writer=request.POST['writer'],lecture=Lecture.objects.get(old_code=request.POST['lecturechoice']));
    target_review.delete()
    return HttpResponseRedirect('../')

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

def ReviewInsertView(request):
    sid_var = "20150390"
    user=UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
    return_object = []
    lecture_list = user.take_lecture_list.all()
    for single_lecture in lecture_list:
        lecture_object = {}
	lecture_object["title"]=single_lecture.title;
	lecture_object["old_code"]=single_lecture.old_code;
	#print "ids"
	#print single_lecture.id
	lecture_object["lecid"]=str(single_lecture.id);
	professor_str="";
	prof_list = single_lecture.professor.all();
	for single_prof_index in range(len(prof_list)):
	    professor_str = professor_str + prof_list[single_prof_index].professor_name
	    if(single_prof_index+1<len(prof_list)):
		professor_str = professor_str + ", "
	lecture_object["professor"]=professor_str
	return_object.append(lecture_object)
    pre_comment =""
    p_holder=""
    try : 
	temp = Comment.objects.get(writer=user)
        pre_comment = temp.comment
    except : p_holder = '여기에 입력하세요'
    ctx = {'object':return_object, 'comment':pre_comment,'p_holder':p_holder}
    return render(request, 'review/review/insert.html',ctx)

def ReviewInsertAdd(request):
#    if request.POST.has_key('content') == False:
 #       return HttpResponse('후기를 입력해주세요.')
  #  else:
  #      if len(request.POST['content'])==0:
   #         return HttpResponse('1글자 이상 입력해주세요.')
   #     else:
#	    comment=request.POST['content']
    sid_var = "20150390"
    lecid = int(request.POST['lecturechoice'])
    course = Course.objects.get(id = lecid)
    lecture = Lecture.objects.get(id = lecid) # 하나로 특정되지않음, 변경요망
    comment = request.POST['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = int(request.POST['gradescore'])
    load = int(request.POST['loadscore'])
    speech = int(request.POST['speechscore'])
    total = (grade+load+speech)//3 #현재 float 불가
    writer = UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
    try :
	user=UserProfile.objects.get(student_id=sid_var) #session 완성시 변경
	temp = Comment.objects.filter(writer=user)
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



