# -*- coding:utf-8 -*-

from django.shortcuts import render, redirect
from apps.session.models import UserProfile
from apps.subject.models import Course, Lecture
from apps.review.models import Comment
from django.http import HttpResponse, HttpResponseRedirect

def SearchView(request):
    return render(request, 'review/search/search.html')



def SearchResultView(request):
    return render(request, 'review/search/result.html')


def ReviewInsertView(request):
    
    user=UserProfile.objects.get(user_id=1) #session 완성시 변경
    lecture_list = user.take_lecture_list.all()
    try : 
	temp = Comment.objects.get(writer=user)
        pre_comment = temp.comment
    except : pre_comment = '여기에 입력하세요'
    ctx = {'object':lecture_list, 'comment':pre_comment}
    return render(request, 'review/review/insert.html',ctx)

def ReviewInsertAdd(request):
#    if request.POST.has_key('content') == False:
 #       return HttpResponse('후기를 입력해주세요.')
  #  else:
  #      if len(request.POST['content'])==0:
   #         return HttpResponse('1글자 이상 입력해주세요.')
   #     else:
#	    comment=request.POST['content']
    course = Course.objects.get(old_code = request.POST['lecturechoice'])
    lecture = Lecture.objects.get(old_code = request.POST['lecturechoice']) # 하나로 특정되지않음, 변경요망
    comment = request.POST['content'] # 항목 선택 안했을시 반응 추가 요망 grade, load도
    grade = int(request.POST['gradescore'])
    load = int(request.POST['loadscore'])
    speech = int(request.POST['speechscore'])
    total = (grade+load+speech)//3 #현재 float 불가
    writer = UserProfile.objects.get(user_id=1) #session 완성시 변경
    try :
	user=UserProfile.objects.get(user_id=1) #session 완성시 변경
	temp = Comment.objects.filter(writer=user)
	temp = temp.get(lecture=lecture)
	temp.comment = comment
	temp.grade = grade
	temp.load = load
	temp.speech = speech
	temp.total = total
	temp.save()
    except :
	new_comment = Comment(course=course, lecture=lecture, comment=comment, grade=grade, load=load, speech=speech, total=total, writer=writer)
        new_comment.save()
    return HttpResponseRedirect('../')



