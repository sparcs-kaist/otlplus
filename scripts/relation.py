from apps.session.models import UserProfile
from apps.subject.models import Course

def run():
    course_list = Course.objects.filter(old_code__startswith="CH", old_code__lt="CH500").order_by("old_code")
    user_profiles = UserProfile.objects.all()

    # (A only, B only, A B both, A -> B, B -> A)
    relation_dict = {}
    for user in user_profiles:
        lecture_info = {}
        for lecture in user.take_lecture_list.all():
            if lecture.old_code.startswith("CH") and lecture.old_code < "CH500":
                lecture_info[lecture.old_code] = (lecture.year, lecture.semester)

        for i in range(len(course_list)):
            for j in range(len(course_list)):
                code_A = course_list[i].old_code
                code_B = course_list[j].old_code
                if code_A >= code_B: continue
                if not (code_A, code_B) in relation_dict:
                    relation_dict[(code_A,code_B)] = [0,0,0,0,0]
                if code_A in lecture_info and code_B in lecture_info:
                    if lecture_info[code_A] == lecture_info[code_B]:
                        x = relation_dict[(code_A,code_B)]
                        x[2] += 1
                    elif lecture_info[code_A] < lecture_info[code_B]:
                        x = relation_dict[(code_A,code_B)]
                        x[3] += 1
                    else:
                        x = relation_dict[(code_A,code_B)]
                        x[4] += 1
                elif code_A in lecture_info:
                    x = relation_dict[(code_A,code_B)]
                    x[0] += 1
                elif code_B in lecture_info:
                    x = relation_dict[(code_A,code_B)]
                    x[1] += 1

    for key, val in relation_dict.iteritems():
        print "%s,%s,%d,%d,%d,%d,%d" % (key[0], key[1], val[0], val[1], val[2], val[3], val[4])
