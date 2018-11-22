from apps.session.models import UserProfile
from apps.subject.models import Course

def run():
    course_list = Course.objects.filter(old_code__startswith="CS", old_code__lt="CS500").order_by("old_code")
    user_profiles = UserProfile.objects.all()

    # [n(A -> B), n(B)]
    relation_dict = {}
    for user in user_profiles:
        lecture_info = {}
        for lecture in user.take_lecture_list.all():
            if lecture.old_code.startswith("CS") and lecture.old_code < "CS500":
                lecture_info[lecture.old_code] = (lecture.year, lecture.semester)

        for i in range(len(course_list)):
            for j in range(len(course_list)):
                code_A = course_list[i].old_code
                code_B = course_list[j].old_code
                if code_A[-3] > code_B[-3]: continue

                if not (code_A, code_B) in relation_dict:
                    relation_dict[(code_A,code_B)] = [0,0]

                if code_A in lecture_info and code_B in lecture_info and lecture_info[code_A] < lecture_info[code_B]:
                    x = relation_dict[(code_A,code_B)]
                    x[0] += 1

                if code_B in lecture_info:
                    x = relation_dict[(code_A,code_B)]
                    x[1] += 1

    # A: [(p, B1), (p, B2)]
    course_prior_dict = {}
    # B: [(p, A1), (p, A2)]
    course_posterior_dict = {}
    
    for course_pair, count_pair in relation_dict.iteritems():
        if count_pair[1] < 5 or 1.0*count_pair[0]/count_pair[1] < 0.4:
            continue

        if not course_pair[0] in course_prior_dict:
            course_prior_dict[course_pair[0]] = []
        
        course_prior_dict[course_pair[0]].append((1.0*count_pair[0]/count_pair[1], course_pair[1]))

        if not course_pair[1] in course_posterior_dict:
            course_posterior_dict[course_pair[1]] = []
        
        course_posterior_dict[course_pair[1]].append((1.0*count_pair[0]/count_pair[1], course_pair[0]))

    for course in course_list:
        if not course in course_prior_dict:
            course.related_courses_prior.clear()
        else:
            prior_courses_code = map(lambda x: x[1], course_prior_dict[course])
            remove_courses = []
            for exist_course in course.related_courses_prior.all():
                if not exist_course.old_code in prior_courses_code:
                    remove_courses.append(exist_course)
                else:
                    prior_courses_code.remove(exist_course.old_code)

            for remove_course in remove_courses:
                course.related_courses_prior.remove(remove_course)

            for new_course_code in prior_courses_code:
                new_course = course_list.get(old_code=new_course_code)
                course.related_courses_prior.add(new_course)

        if not course in course_posterior_dict:
            course.related_courses_posterior.clear()
        else:
            posterior_courses_code = map(lambda x: x[1], course_posterior_dict[course])
            remove_courses = []
            for exist_course in course.related_courses_posterior.all():
                if not exist_course.old_code in posterior_courses_code:
                    remove_courses.append(exist_course)
                else:
                    posterior_courses_code.remove(exist_course.old_code)

            for remove_course in remove_courses:
                course.related_courses_posterior.remove(remove_course)

            for new_course_code in posterior_courses_code:
                new_course = course_list.get(old_code=new_course_code)
                course.related_courses_posterior.add(new_course)

