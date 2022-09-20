# -*- encoding: utf-8 -*-

# https://github.com/jadehaus/UCE-KAIST-Public/blob/423ef618e0ccdd6c3efcba93a43f9cba72cedd44/app/models.py

"""
Copyright (c) Minu Kim - minu.kim@kaist.ac.kr
Templates from AppSeed.us
"""

from app import db, login, app
from flask_login import UserMixin, AnonymousUserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from time import time
import jwt
import json

enrolment = db.Table('enrolment',
                     db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
                     db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True))


class User(UserMixin, db.Model):
    """
    db.Model class that defines a user.
    Parameters
    ----------
    id, username, email: db.Column
        stores id (in number id), username (user specified username), and email
    password_hash: db.Column
        stores a hash value of a password.
    admitted_year: db.Column
        admitted year to KAIST in integer (e.g. 2018)
    department: db.relationship
        db.Model class of department for each user
    courses: db.relationship
        relationship table of db.Model for taken courses for each user.
    course_info: db.Column
        string of json that stores course information for each user
    doubly_recognized: db.Column
        string of json that stores the list of courses in course.id
        that are chosen to be doubly recognized (상호인정 과목)
    replaced: db.Column
        string of json that stores the list of courses in course.id
        that are chosen to be replaced by different courses. (대체 교과목)
    individual: db.Column
        string of json that stores the list of courses in course.id
        that are chosen to be determined as courses for individually designed major.
    recognized_as: db.Column
        string of json that stores the list of courses in course.id
        that are chosen to be recognized as other major courses (타학과 인정 교과목)
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    admitted_year = db.Column(db.Integer)
    department = db.relationship('Department', backref='user', uselist=False)
    courses = db.relationship('Course', secondary=enrolment, backref='enrolment')
    course_info = db.Column(db.Text)

    doubly_recognized = db.Column(db.String(64))
    replaced = db.Column(db.String(64))
    individual = db.Column(db.String(64))
    recognized_as = db.Column(db.String(128))

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        """
        stores hashed values of user typed password.
        uses werkzeug security modules
        Parameters
        ----------
        password: str
            user typed string value
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        checks whether the user typed password equals the stored value
        when hashed with werkzeug security modules
        Parameters
        ----------
        password: str
            user typed string value
        Returns
        -------
        check_password: bool
            boolean value that specifies whether the typed password
            matches stored value when hashed.
        """
        return check_password_hash(self.password_hash, password)

    def get_reset_password_token(self, expires_in=600):
        """
        gets a reset_password_token in case user requests.
        TBA later
        """
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_reset_password_token(token):
        """
        verifies a reset password token
        TBA later
        """
        try:
            id = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])['reset_password']
        except:
            return
        return User.query.get(id)

    def valid_department(self):
        """
        checks whether the user chosen department is valid
        in terms of graduation requirements.
        Returns
        -------
        valid_department: bool
            True if the department choice is valid.
        """
        try:
            if self.department.major is None:
                return False
            if self.department.major == "":
                return False
        except AttributeError:
            return False

        if self.department.double_major + self.department.minor == "":
            if self.department.is_advanced_major + self.department.is_individually_designed == 0:
                return False

        if self.department.major == "MSB":
            if self.department.double_major == "":
                return False

        return True

    def required_major_credits(self):
        """
        calculates and returns the required major credits for graduation.
        considers the departments and admitted year of the user.
        Returns
        -------
        dict_major_credits: dict
            dictionary of required major credit values
        """
        if not self.valid_department():
            return None

        year = self.admitted_year
        if year is None:
            year = 2021

        major = self.department.major
        minor = self.department.minor
        double_major = self.department.double_major
        is_advanced_major = self.department.is_advanced_major

        dict_major_credits = {}

        # 건설및환경공학과학과 전공과목 이수요건
        if year <= 2015:
            if major == "CE":
                dict_major_credits["CE"] = (12, 45)
            if "CE" in minor:
                dict_major_credits["CE"] = (12, 21)
            if "CE" in double_major:
                dict_major_credits["CE"] = (12, 40)
        if year >= 2016:
            if major == "CE":
                dict_major_credits["CE"] = (12, 45)
                if is_advanced_major:
                    dict_major_credits["CE"] = (12, 57)
            if "CE" in minor:
                dict_major_credits["CE"] = (12, 18)
            if "CE" in double_major:
                dict_major_credits["CE"] = (12, 40)

        # 기계공학과 전공과목 이수요건
        if year <= 2015:
            if major == "ME":
                if year <= 2012:
                    dict_major_credits["ME"] = (9, 49)
                else:
                    dict_major_credits["ME"] = (12, 59)
            if "ME" in minor:
                dict_major_credits["ME"] = (9, 21)
            if "ME" in double_major:
                dict_major_credits["ME"] = (12, 40)
        if year >= 2016:
            if major == "ME":
                dict_major_credits["ME"] = (12, 48)
                if is_advanced_major:
                    dict_major_credits["ME"] = (12, 63)
            if "ME" in minor:
                dict_major_credits["ME"] = (6, 21)
            if "ME" in double_major:
                dict_major_credits["ME"] = (12, 40)

        # 기술경영학부 전공과목 이수요건
        if year <= 2015:
            if major == "MSB":
                dict_major_credits["MSB"] = (9, 42)
            if "MSB" in minor:
                dict_major_credits["MSB"] = (6, 18)
            if "MSB" in double_major:
                dict_major_credits["MSB"] = (6, 40)
        if year >= 2016:
            if major == "MSB":
                dict_major_credits["MSB"] = (9, 48)
            if "MSB" in minor:
                dict_major_credits["MSB"] = (6, 18)
            if "MSB" in double_major:
                dict_major_credits["MSB"] = (6, 40)

        # 물리학과 전공과목 이수요건
        if year <= 2015:
            if major == "PH":
                dict_major_credits["PH"] = (19, 40)
            if "PH" in minor:
                dict_major_credits["PH"] = (6, 19)
            if "PH" in double_major:
                dict_major_credits["PH"] = (19, 40)
        if year >= 2016:
            if major == "PH":
                dict_major_credits["PH"] = (19, 43)
                if is_advanced_major:
                    dict_major_credits["PH"] = (19, 55)
            if "PH" in minor:
                dict_major_credits["PH"] = (6, 18)
            if "PH" in double_major:
                dict_major_credits["PH"] = (19, 40)

        # 바이오및뇌공학과 전공과목 이수요건
        if year <= 2015:
            if major == "BiS":
                dict_major_credits["BiS"] = (14, 42)
            if "BiS" in minor:
                dict_major_credits["BiS"] = (14, 18)
            if "BiS" in double_major:
                dict_major_credits["BiS"] = (14, 40)
        if year >= 2016:
            if major == "BiS":
                dict_major_credits["BiS"] = (14, 44)
                if is_advanced_major:
                    dict_major_credits["BiS"] = (14, 56)
            if "BiS" in minor:
                dict_major_credits["BiS"] = (14, 18)
            if "BiS" in double_major:
                dict_major_credits["BiS"] = (14, 40)

        # 산업디자인학과 전공과목 이수요건
        if year <= 2015:
            if major == "ID":
                dict_major_credits["ID"] = (27, 54)
            if "ID" in minor:
                dict_major_credits["ID"] = (9, 18)
            if "ID" in double_major:
                dict_major_credits["ID"] = (27, 40)
        if year >= 2016:
            if major == "ID":
                dict_major_credits["ID"] = (15, 45)
                if is_advanced_major:
                    dict_major_credits["ID"] = (15, 57)
            if "ID" in minor:
                dict_major_credits["ID"] = (9, 18)
            if "ID" in double_major:
                dict_major_credits["ID"] = (15, 40)

        # 산업및시스템공학과 전공과목 이수요건
        if year <= 2015:
            if major == "IE":
                dict_major_credits["IE"] = (24, 51)
            if "IE" in minor:
                dict_major_credits["IE"] = (0, 18)
            if "IE" in double_major:
                dict_major_credits["IE"] = (24, 40)
        if year >= 2016:
            if major == "IE":
                dict_major_credits["IE"] = (24, 45)
                if is_advanced_major:
                    dict_major_credits["IE"] = (24, 57)
            if "IE" in minor:
                dict_major_credits["IE"] = (0, 18)
            if "IE" in double_major:
                dict_major_credits["IE"] = (24, 40)

        # 생명과학과 전공과목 이수요건
        if year <= 2015:
            if major == "BS":
                dict_major_credits["BS"] = (18, 48)
            if "BS" in minor:
                dict_major_credits["BS"] = (12, 21)
            if "BS" in double_major:
                dict_major_credits["BS"] = (18, 40)
        if year >= 2016:
            if major == "BS":
                dict_major_credits["BS"] = (18, 42)
                if is_advanced_major:
                    dict_major_credits["BS"] = (18, 54)
            if "BS" in minor:
                dict_major_credits["BS"] = (12, 21)
            if "BS" in double_major:
                dict_major_credits["BS"] = (18, 40)

        # 생명화학공학과 전공과목 이수요건
        if year <= 2015:
            if major == "CBE":
                dict_major_credits["CBE"] = (21, 41)
                if year <= 2013:
                    dict_major_credits["CBE"] = (18, 41)
                if year <= 2010:
                    dict_major_credits["CBE"] = (6, 41)
            if "CBE" in minor:
                if year <= 2010:
                    dict_major_credits["CBE"] = (3, 18)
                else:
                    dict_major_credits["CBE"] = (9, 18)
            if "CBE" in double_major:
                dict_major_credits["CBE"] = (21, 41)
        if year >= 2016:
            if major == "CBE":
                dict_major_credits["CBE"] = (21, 42)
                if is_advanced_major:
                    dict_major_credits["CBE"] = (21, 54)
            if "CBE" in minor:
                dict_major_credits["CBE"] = (9, 18)
            if "CBE" in double_major:
                dict_major_credits["CBE"] = (21, 42)

        # 수리과학과 전공과목 이수요건
        if year <= 2015:
            if major == "MAS":
                dict_major_credits["MAS"] = (0, 42)
            if "MAS" in minor:
                dict_major_credits["MAS"] = (0, 18)
            if "MAS" in double_major:
                dict_major_credits["MAS"] = (0, 40)
        if year >= 2016:
            if major == "MAS":
                dict_major_credits["MAS"] = (0, 42)
                if is_advanced_major:
                    dict_major_credits["MAS"] = (0, 55)
            if "MAS" in minor:
                dict_major_credits["MAS"] = (0, 18)
            if "MAS" in double_major:
                dict_major_credits["MAS"] = (0, 40)

        # 신소재공학과 전공과목 이수요건
        if year <= 2015:
            if major == "MS":
                dict_major_credits["MS"] = (18, 42)
            if "@MS@" in minor:
                dict_major_credits["MS"] = (9, 18)
            if "@MS@" in double_major:
                dict_major_credits["MS"] = (18, 40)
        if year >= 2016:
            if major == "MS":
                dict_major_credits["MS"] = (18, 42)
                if is_advanced_major:
                    dict_major_credits["MS"] = (18, 57)
            if "@MS@" in minor:
                dict_major_credits["MS"] = (9, 18)
            if "@MS@" in double_major:
                dict_major_credits["MS"] = (18, 40)

        # 원자력및양자공학과 전공과목 이수요건
        if year <= 2015:
            if major == "NQE":
                dict_major_credits["NQE"] = (25, 43)
            if "NQE" in minor:
                dict_major_credits["NQE"] = (15, 21)
            if "NQE" in double_major:
                dict_major_credits["NQE"] = (25, 40)
        if year >= 2016:
            if major == "NQE":
                dict_major_credits["NQE"] = (25, 43)
                if is_advanced_major:
                    dict_major_credits["NQE"] = (25, 55)
            if "NQE" in minor:
                dict_major_credits["NQE"] = (15, 21)
            if "NQE" in double_major:
                dict_major_credits["NQE"] = (25, 40)

        # 융합인재학부 이수요건
        if major == "TS":
            dict_major_credits["TS"] = (21, 42)
            if is_advanced_major:
                dict_major_credits["TS"] = (21, 54)
        if "TS" in minor:
            dict_major_credits["TS"] = (18, 18)
        if "TS" in double_major:
            dict_major_credits["TS"] = (21, 42)

        # 전기및전자공학부 전공과목 이수요건
        if year <= 2015:
            if major == "EE":
                dict_major_credits["EE"] = (18, 53)
                if double_major + minor != "":
                    dict_major_credits["EE"] = (18, 47)
                if year <= 2013:
                    dict_major_credits["EE"] = (18, 47)
            if "EE" in minor:
                dict_major_credits["EE"] = (12, 21)
            if "EE" in double_major:
                dict_major_credits["EE"] = (18, 40)
        if year >= 2016:
            if major == "EE":
                dict_major_credits["EE"] = (18, 50)
                if is_advanced_major:
                    dict_major_credits["EE"] = (18, 62)
            if "EE" in minor:
                dict_major_credits["EE"] = (3, 21)
            if "EE" in double_major:
                dict_major_credits["EE"] = (18, 40)
        if year >= 2018:
            if major == "EE":
                dict_major_credits["EE"] = (15, 50)
                if is_advanced_major:
                    dict_major_credits["EE"] = (15, 62)
            if "EE" in minor:
                dict_major_credits["EE"] = (3, 21)
            if "EE" in double_major:
                dict_major_credits["EE"] = (15, 40)

        # 전산학부 전공과목 이수요건
        if year <= 2015:
            if major == "CS":
                dict_major_credits["CS"] = (19, 43)
            if "CS" in minor:
                dict_major_credits["CS"] = (15, 21)
            if "CS" in double_major:
                dict_major_credits["CS"] = (19, 40)
        if year >= 2016:
            if major == "CS":
                dict_major_credits["CS"] = (19, 49)
                if is_advanced_major:
                    dict_major_credits["CS"] = (19, 61)
            if "CS" in minor:
                dict_major_credits["CS"] = (15, 21)
            if "CS" in double_major:
                dict_major_credits["CS"] = (19, 40)

        # 항공우주공학과 전공과목 이수요건
        if year <= 2015:
            if major == "AE":
                dict_major_credits["AE"] = (19, 49)
            if "AE" in minor:
                dict_major_credits["AE"] = (12, 21)
            if "AE" in double_major:
                dict_major_credits["AE"] = (19, 40)
        if year >= 2016:
            if major == "AE":
                dict_major_credits["AE"] = (21, 42)
                if is_advanced_major:
                    dict_major_credits["AE"] = (21, 60)
            if "AE" in minor:
                dict_major_credits["AE"] = (9, 18)
            if "AE" in double_major:
                dict_major_credits["AE"] = (21, 42)

        # 화학과 전공과목 이수요건
        if year <= 2015:
            if major == "CH":
                dict_major_credits["CH"] = (24, 42)
                if year <= 2011:
                    dict_major_credits["CH"] = (18, 42)
            if "CH" in minor:
                dict_major_credits["CH"] = (12, 21)
            if "CH" in double_major:
                dict_major_credits["CH"] = (24, 40)
        if year >= 2016:
            if major == "CH":
                dict_major_credits["CH"] = (24, 42)
                if is_advanced_major:
                    dict_major_credits["CH"] = (24, 54)
            if "CH" in minor:
                dict_major_credits["CH"] = (12, 21)
            if "CH" in double_major:
                dict_major_credits["CH"] = (24, 40)

        return dict_major_credits

    def required_other_credits(self):
        """
        calculates and returns credits other than major credits
        that are required for graduation.
        considers department and admitted year of the user.
        Returns
        -------
        elective_basic: int
            required credit for elective basic courses
        research: int
            requried credit for research courses
        total_major: int
            required credit for his/her major courses.
            calculated from required_major_credits()
        total_other_major: int
            required credit for his/her other majors other than his/her department.
            calculated from required_major_credits()
        humanities: int
            required credit for humanities courses.
        """

        # 전공 필수 및 교양 필수 학점을 제외한 필요 학점만 계산함.
        if not self.valid_department():
            return None

        # 기초 선택 학점 이수 요건
        if self.department.double_major == "":
            elective_basic = 9
        else:
            if self.department.major in ["ME", "PH", "BiS", "MAS", "EE", "CS"]:
                elective_basic = 3
            else:
                elective_basic = 6

        # 연구 학점 이수 요건
        if self.department.double_major != "":
            research = 0
        else:
            if self.department.major in ["MSB", "IE", "CBE"]:
                research = 4
            elif self.department.major in ["PH", "BiS"]:
                research = 5
            else:
                research = 3

        # 총 전공 학점 이수 요건
        required_major_credits = self.required_major_credits()
        total_major = required_major_credits[self.department.major][1]
        total_other_major = 0
        for key in required_major_credits:
            if key != self.department.major:
                total_other_major += required_major_credits[key][1]
        if self.department.is_individually_designed == 1:
            total_other_major += 12

        # 인문 사회 선택 학점 이수 요건
        humanities = 21
        if self.department.double_major != "":
            humanities = 12

        return elective_basic, research, total_major, total_other_major, humanities

    def required_credits(self):
        """
        calculates and returns all credits including the total credits
        that are required for graduation.
        Returns
        -------
        mandatory_general: int
            required credit for mandatory general courses
        mandatory_basic: int
            required credit for mandatory basic courses
        elective_basic: int
            required credit for elective basic courses
        research: int
            requried credit for research courses
        total_major: int
            required credit for his/her major courses.
            calculated from required_major_credits()
        total_other_major: int
            required credit for his/her other majors other than his/her department.
            calculated from required_major_credits()
        humanities: int
            required credit for humanities courses.
        """

        if not self.valid_department():
            return None

        required_other_credits = self.required_other_credits()
        mandatory_general = 7
        mandatory_basic = 23
        elective_basic = required_other_credits[0]
        research = required_other_credits[1]
        major = required_other_credits[2]
        other_major = required_other_credits[3]
        humanities = required_other_credits[4]

        if self.admitted_year <= 2015:
            total = 130
        else:
            total = 136

        return mandatory_general, mandatory_basic, elective_basic, research, \
               major, other_major, humanities, total

    def completed_credits(self):
        """
        calculates and returns completed credits for a user.
        considers db.department, db.courses and db.admitted_year.
        Returns
        -------
        mandatory_general: int
        mandatory_au: int
        mandatory_basic: int
        elective_basic: int
        major: int
            completed credits for all major requirements
            of his/her department (summed up)
        other_major: int
            completed credits for all other major requirements
            that are not from his/her department (summed up)
        humanities: int
        others: int
        research: int
        dict_completed_major: dict
            dictionary that stores completed credits
            for major courses of each department
        individual_major: dict
        total: int
            total credit one has completed
        """
        if not self.valid_department():
            return None

        courses = self.courses
        if courses is None:
            courses = []

        for course in courses:
            if "EE Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="EE405").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="EE490").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)

            if "ISysE Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="IE436").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="IE481").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)
                course3 = Course.query.filter_by(code="IE490").first()
                if (course3 not in courses) and (course3 is not None):
                    courses.append(course3)

            if "ME Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="ME490").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)

            if "SoC Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="CS490").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="CS409").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)

        mandatory_general = 0
        mandatory_au = 0
        mandatory_basic = 0
        elective_basic = 0
        major = 0
        other_major = 0
        humanities = 0
        research = 0
        others = 0
        individual_major = 0
        dict_completed_major = {}
        total = 0

        required_major_credits = self.required_major_credits()
        for key in required_major_credits:
            dict_completed_major[key] = [0, 0]
        for course in courses:
            try:
                course_info = json.loads(self.course_info)
                if str(course.id) in course_info:
                    if course_info[str(course.id)]["letter"] in ["F", "U"]:
                        continue
            except KeyError:
                pass
            except TypeError:
                pass
            if "Co-op 2" in course.name:
                others += 3
                total += 3
                continue
            if "ISysE Co-op 1" in course.name:
                continue
            if "ME Co-op 1" in course.name:
                others += 3
                try:
                    dict_completed_major["ME"][1] += 3
                except KeyError:
                    total -= 3
                total += 6
                continue
            if "Co-op 1" in course.name:
                others += 3
                total += 3
                continue
            if "@" + str(course.id) + "@" in self.doubly_recognized:
                recognizables = course.recognizables() + [course.extract_department(replace=False)]
                for key in required_major_credits:
                    if key in recognizables:
                        if key == course.extract_department(replace=False):
                            if '필수' in course.subject_type:
                                dict_completed_major[key][0] += int(course.credit)
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)
                            else:
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)
                        else:
                            dict_completed_major[key][1] += int(course.credit)
                            total += int(course.credit)
                continue
            if "@" + str(course.id) + "@" in self.replaced:
                course = Course.query.filter_by(code=course.replaceables()).first()
            if "AU" in course.credit:
                mandatory_au += int(course.credit[0])
            elif course.subject_type == '교양필수':
                mandatory_general += int(course.credit)
                total += int(course.credit)
            elif course.subject_type == '기초필수':
                mandatory_basic += int(course.credit)
                total += int(course.credit)
            elif course.subject_type == '기초선택':
                elective_basic += int(course.credit)
                total += int(course.credit)
            elif course.subject_type == '인문사회선택':
                humanities += int(course.credit)
                total += int(course.credit)
            elif ('전공' in course.subject_type) or ("석/박" in course.subject_type):
                if "@" + str(course.id) + "@" in self.individual:
                    individual_major += int(course.credit)
                    total += int(course.credit)
                    continue

                subject_type = course.subject_type
                code = course.code
                recognized = json.loads(self.recognized_as)
                if str(course.id) in recognized:
                    subject_type = "전공선택"
                    code = recognized[str(course.id)]

                for key in required_major_credits:
                    # 해당 과목이 이수요건에 필요한 전공 교과목일 경우
                    if key in code:
                        # 해당 과목이 주전공 교과목일 경우
                        if key == self.department.major:
                            if '필수' in subject_type:
                                dict_completed_major[key][0] += int(course.credit)
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)
                            else:
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)

                        # 해당 과목이 주전공 이외 복/부전공 학과의 교과목일 경우
                        else:
                            # 그 외 일반적인 경우
                            if '필수' in subject_type:
                                dict_completed_major[key][0] += int(course.credit)
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)
                            else:
                                dict_completed_major[key][1] += int(course.credit)
                                total += int(course.credit)

                is_other = True
                for key in required_major_credits:
                    if key in code:
                        is_other = False
                if is_other:
                    total += int(course.credit)
                    others += int(course.credit)

            elif ('연구' in course.subject_type) or ("세미나" in course.subject_type):
                if self.department.major in course.code:
                    research += int(course.credit)
                else:
                    others += int(course.credit)
                total += int(course.credit)
            else:
                try:
                    others += int(course.credit)
                    total += int(course.credit)
                except ValueError:
                    print('Unexpected non-integer credit in: ', course.name)
                    pass

        for key in dict_completed_major:
            if key == self.department.major:
                major += dict_completed_major[key][1]
            else:
                other_major += dict_completed_major[key][1]

        other_major += individual_major

        return mandatory_general, mandatory_au, mandatory_basic, elective_basic, major, other_major, \
               humanities, others, research, dict_completed_major, individual_major, total

    def total_credits(self):
        """
        calculates and returns total credits a user has taken
        this excludes AU credits
        Returns
        -------
        total: int
            total credit a user has taken
        """
        total = 0
        for course in self.courses:
            if "AU" not in course.credit:
                total += int(course.credit)
        return total

    def remaining_credits(self):
        """
        calculates and returns remaining credits to be taken
        until the requirement for graduation is fulfilled.
        Returns
        -------
        happy, exciting, leadership, physical, mandatory_general, \
        mandatory_basic, elective_basic, research, humanities: int
        major, other_major: list
            list of integers of size 2 which consists of mandatory major credits and others.
            (전공필수 학점, 전공선택 학점)
        """
        if not self.valid_department():
            return None

        courses = self.courses
        if courses is None:
            courses = []

        required_other_credits = self.required_other_credits()
        mandatory_general = 7
        mandatory_basic = 23
        elective_basic = required_other_credits[0]
        research = required_other_credits[1]
        humanities = required_other_credits[4]

        happy = 1
        exciting = 1
        leadership = 2
        physical = 4

        rm = self.required_major_credits()
        cm = self.completed_credits()[-3]
        completed_individual = self.completed_credits()[-2]
        dict_remaining_major = {}
        try:
            for key in rm:
                dict_remaining_major[key] = (max(0, rm[key][0] - cm[key][0]),
                                             max(0, rm[key][1] - cm[key][1]))
        except:
            return None

        other_major = [0, 0]
        for key in dict_remaining_major:
            if key == self.department.major:
                major = dict_remaining_major[key]
            else:
                other_major = [other_major[0] + dict_remaining_major[key][0],
                               other_major[1] + dict_remaining_major[key][1]]
        if self.department.is_individually_designed:
            other_major[1] += (12 - completed_individual)

        for course in courses:
            try:
                course_info = json.loads(self.course_info)
                if str(course.id) in course_info:
                    if course_info[str(course.id)]["letter"] in ["F", "U"]:
                        continue
            except KeyError:
                pass
            except TypeError:
                pass
            if "AU" in course.credit:
                if course.code == 'HSS090':
                    happy = 0
                elif course.code == 'HSS091':
                    exciting = 0
                elif '인성/리더십' in course.name:
                    leadership -= 1
                else:
                    physical -= 2
            elif course.code in ["HSS001", "HSS022", "HSS023", "HSS024", "HSS025"]:
                mandatory_general -= int(course.credit)
            elif course.subject_type == "기초필수":
                mandatory_basic -= int(course.credit)
            elif course.subject_type == "기초선택":
                elective_basic -= int(course.credit)
            elif course.subject_type == "인문사회선택":
                humanities -= int(course.credit)
            elif ('연구' in course.subject_type) or ("세미나" in course.subject_type):
                research -= int(course.credit)
            elif "전공" in course.subject_type:
                pass
            else:
                pass

        return happy, exciting, max(0, leadership), max(0, physical), \
               max(0, mandatory_general), max(0, mandatory_basic), max(0, elective_basic), \
               max(0, research), major, other_major, max(0, humanities)

    def render_remaining_total_credits(self):
        """
        calculates and returns remaining total credits
        the valud is used to render html file
        Returns
        -------
        remaining_total: int
            remaining total credit until graduation
        """
        if not self.valid_department():
            return None
        remaining_credits = self.remaining_credits()
        completed_credits = self.completed_credits()
        requirement = self.required_credits()[-1]
        remaining = sum(remaining_credits[4:8]) + remaining_credits[8][1] + \
                    remaining_credits[9][1] + remaining_credits[10]
        total = sum(completed_credits[:-3]) - completed_credits[1]
        return max(requirement - total, remaining)

    def remaining_courses(self):
        """
        calculates and returns remaining courses that must be taken to graduate.
        return value consists of multiple tuples that contain 1) a list of course codes and
        2) number of courses that may be skipped.
        Returns
        -------
        general_mandatory: tuple
        major_mandatory: tuple
        """
        if not self.valid_department():
            return None

        courses = self.courses
        if courses is None:
            courses = []

        # 기초필수, 교양필수 과목 이수 요건
        general_mandatory = ["HSS022", "HSS023", "HSS024", "HSS025", "HSS090", "HSS091", "HSS001",
                             ("PH141", "PH161"), ("PH142", "PH162"), "BS120", "CH101", "MAS101", "MAS102",
                             ("CH102", "CH451"), "CS101"]
        if self.admitted_year >= 2020:
            general_mandatory.append(("PH151", "PH152"))
        else:
            general_mandatory.append("PH151")

        for course in courses:
            if "EE Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="EE405").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="EE490").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)

            if "ISysE Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="IE436").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="IE481").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)
                course3 = Course.query.filter_by(code="IE490").first()
                if (course3 not in courses) and (course3 is not None):
                    courses.append(course3)

            if "ME Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="ME490").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)

            if "SoC Co-op 1" in course.name:
                course1 = Course.query.filter_by(code="CS490").first()
                if (course1 not in courses) and (course1 is not None):
                    courses.append(course1)
                course2 = Course.query.filter_by(code="CS409").first()
                if (course2 not in courses) and (course2 is not None):
                    courses.append(course2)

        for course in courses:
            for code in general_mandatory:
                if course.code in code:
                    general_mandatory.remove(code)
            if course.code == "PH171":
                for code in general_mandatory:
                    if "PH141" in code:
                        general_mandatory.remove(code)
                    if "PH151" in code:
                        general_mandatory.remove(code)
            if course.code == "PH172":
                for code in general_mandatory:
                    if "PH142" in code:
                        general_mandatory.remove(code)
                    if "PH152" in code:
                        general_mandatory.remove(code)

        # 전공과목 이수요건
        major_mandatory = []

        # 건설및환경공학과학과 이수요건
        if self.department.major == "CE":
            major_mandatory.append((["CE201", "CE230", "CE350", "CE371"], 0))
            if self.department.double_major == "":
                major_mandatory.append((["CE490"], 0))
        if "CE" in self.department.minor:
            major_mandatory.append((["CE201", "CE230", "CE350", "CE371"], 0))
        if "CE" in self.department.double_major:
            major_mandatory.append((["CE201", "CE230", "CE350", "CE371"], 0))

        # 기계공학과 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "ME":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 1))
                    major_mandatory.append((["ME490", "ME401"], 1))
                if self.admitted_year <= 2012:
                    major_mandatory.append((["ME200", "ME205", "ME400"], 0))
                    major_mandatory.append((["ME231", "ME340", "ME251", "ME360", "ME361",
                                             "ME211", "ME221", "ME307", "ME370"], 3))
                else:
                    major_mandatory.append((["ME200", "ME205", "ME400", "ME340"], 0))
                    major_mandatory.append((["ME231", "ME340", "ME251", "ME360", "ME361",
                                             "ME211", "ME221", "ME307", "ME370", "ME311"], 4))
            if "ME" in self.department.minor:
                major_mandatory.append((["ME200", "ME205", "ME400"], 0))
                major_mandatory.append((["ME231", "ME340", "ME251", "ME360", "ME361",
                                         "ME211", "ME221", "ME307", "ME370", "ME311"], 6))
            if "ME" in self.department.double_major:
                major_mandatory.append((["ME200", "ME205", "ME400", "ME340"], 0))
        if self.admitted_year >= 2016:
            if self.department.major == "ME":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 1))
                    major_mandatory.append((["ME490", "ME401"], 1))
                major_mandatory.append((["ME231", "ME340", "ME251", "ME360", "ME361",
                                         "ME211", "ME221", "ME307", "ME370", "ME311"], 5))
            if "ME" in self.department.minor:
                major_mandatory.append((["ME200", "ME205", "ME400", "ME340"], 2))
            if "ME" in self.department.double_major:
                major_mandatory.append((["ME200", "ME205", "ME400", "ME340"], 0))

        # 기술경영학부 이수요건
        if self.department.major == "MSB":
            major_mandatory.append((["MSB200", "MSB204", "MSB351"], 0))
            major_mandatory.append((["MSB493", "MSB490"], 1))
            major_mandatory.append((["MSB496"], 0))
        if "MSB" in self.department.minor:
            major_mandatory.append((["MSB200", "MSB204", "MSB351"], 1))
        if "MSB" in self.department.double_major:
            major_mandatory.append((["MSB200", "MSB204", "MSB351"], 1))

        # 물리학과 이수요건
        if self.department.major == "PH":
            major_mandatory.append((["PH152"], 0))
            major_mandatory.append((["PH221", "PH231", "PH251", "PH301", "PH302", "PH311", "PH351"], 0))
            if self.department.double_major == "":
                major_mandatory.append((["PH490", "PH496"], 0))
        if "PH" in self.department.minor:
            major_mandatory.append((["PH301", "PH351"], 0))
        if "PH" in self.department.double_major:
            major_mandatory.append((["PH221", "PH231", "PH251", "PH301", "PH302", "PH311", "PH351"], 0))

        # 바이오및뇌공학과 이수요건
        if self.department.major == "BiS":
            if self.department.double_major == "":
                major_mandatory.append((["MAS109", "MAS201", "MAS250"], 0))
                major_mandatory.append((["BiS490", "BiS496"], 0))
            else:
                major_mandatory.append((["MAS109", "MAS201", "MAS250"], 2))
            major_mandatory.append((["BiS200", "BiS222", "BiS301", "BiS350"], 0))
        if "BiS" in self.department.minor:
            major_mandatory.append((["BiS200", "BiS222", "BiS301", "BiS350"], 0))
        if "BiS" in self.department.double_major:
            major_mandatory.append((["BiS200", "BiS222", "BiS301", "BiS350"], 0))

        # 산업디자인학과 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "ID":
                major_mandatory.append((["ID202"], 0))
                major_mandatory.append((["ID211", "ID212", "ID213", "ID301",
                                         "ID304", "ID402", "ID403", "ID409", "ID414"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["ID490"], 0))
            if "ID" in self.department.minor:
                major_mandatory.append((["ID212", "ID213", "ID301"], 0))
            if "ID" in self.department.double_major:
                major_mandatory.append((["ID211", "ID212", "ID213", "ID301",
                                         "ID304", "ID402", "ID403", "ID409", "ID414"], 0))
        if self.admitted_year >= 2016:
            if self.department.major == "ID":
                major_mandatory.append((["ID202"], 0))
                major_mandatory.append((["ID212", "ID213", "ID301", "ID304", "ID403"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["ID490"], 0))
                if self.department.is_advanced_major == 1:
                    major_mandatory.append((["ID409", "ID414"], 0))
            if "ID" in self.department.minor:
                major_mandatory.append((["ID212", "ID213", "ID301"], 0))
            if "ID" in self.department.double_major:
                major_mandatory.append((["ID212", "ID213", "ID301", "ID304", "ID403"], 0))

        # 산업및시스템공학과 이수요건
        if self.department.major == "IE":
            major_mandatory.append((["MAS109"], 0))
            major_mandatory.append((["IE241", "IE251", "IE260", "IE261", "IE331"], 0))
            major_mandatory.extend([(["IE221", "IE321"], 1), (["IE232", "IE332"], 1), (["IE242", "IE341"], 1)])
            if self.department.double_major == "":
                major_mandatory.append((["IE490", "IE496"], 0))
        if "IE" in self.department.double_major:
            major_mandatory.append((["IE241", "IE251", "IE260", "IE261", "IE331"], 0))
            major_mandatory.extend([(["IE221", "IE321"], 1), (["IE232", "IE332"], 1), (["IE242", "IE341"], 1)])

        # 생명과학과 이수요건
        if self.department.major == "BS":
            major_mandatory.append((["CH103"], 0))
            if self.department.double_major == "":
                major_mandatory.append((["BS490"], 0))
            major_mandatory.append((["BS209", "BS205", "BS208", "BS200", "BS202", "BS319"], 0))
        if "BS" in self.department.double_major:
            major_mandatory.append((["BS209", "BS205", "BS208", "BS200", "BS202", "BS319"], 0))

        # 생명화학공학과 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "CBE":
                if self.admitted_year <= 2010:
                    major_mandatory.append((["CBE201", "CBE301"], 0))
                elif self.admitted_year <= 2013:
                    major_mandatory.append((["CBE201", "CBE202", "CBE203", "CBE205", "CBE221", "CBE301"], 0))
                else:
                    major_mandatory.append((["CBE201", "CBE202", "CBE203", "CBE205",
                                             "CBE221", "CBE301", "CBE442"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["CBE490", "CBE496"], 0))
            if "CBE" in self.department.minor:
                major_mandatory.append((["CBE201", "CBE301"], 1))
                if self.admitted_year > 2010:
                    major_mandatory.append((["CBE202"], 0))
            if "CBE" in self.department.double_major:
                major_mandatory.append((["CBE201", "CBE202", "CBE203", "CBE205",
                                         "CBE221", "CBE301", "CBE442"], 0))
        if self.admitted_year >= 2016:
            if self.department.major == "CBE":
                major_mandatory.append((["CBE201", "CBE202", "CBE203", "CBE205",
                                         "CBE221", "CBE301", "CBE442"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["CBE490", "CBE496"], 0))
                if self.department.is_advanced_major == 1:
                    major_mandatory.append((["CBE206", "CBE261", "CBE311", "CBE331", "CBE332", "CBE351"], 2))
            if "CBE" in self.department.minor:
                major_mandatory.append((["CBE201", "CBE301"], 1))
                major_mandatory.append((["CBE202"], 0))
            if "CBE" in self.department.double_major:
                major_mandatory.append((["CBE201", "CBE202", "CBE203", "CBE205",
                                         "CBE221", "CBE301", "CBE442"], 0))

        # 수리과학과 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "MAS":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 1))
                else:
                    major_mandatory.append(["MAS201", "MAS202"], 1)
                major_mandatory.append((["MAS212", "MAS241", "MAS311", "MAS321", "MAS331", "MAS341", "MAS250"], 3))
                if self.department.is_advanced_major == 1:
                    major_mandatory.append((["MAS242", "MAS312", "MAS430", "MAS440"], 0))
            if "MAS" in self.department.double_major:
                major_mandatory.append((["MAS212", "MAS241", "MAS311", "MAS321", "MAS331", "MAS341", "MAS250"], 3))
        if self.admitted_year >= 2016:
            if self.department.major == "MAS":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS109", "MAS201", "MAS202", "MAS250"], 2))
                else:
                    major_mandatory.append((["MAS201", "MAS202", "MAS250"], 2))
                major_mandatory.append((["MAS212", "MAS241", "MAS311", "MAS321", "MAS331", "MAS341", "MAS355"], 3))
                if self.department.is_advanced_major == 1:
                    major_mandatory.append((["MAS242", "MAS312", "MAS430", "MAS440"], 0))
            if "MAS" in self.department.double_major:
                major_mandatory.append((["MAS212", "MAS241", "MAS311", "MAS321", "MAS331", "MAS341", "MAS355"], 3))

        # 신소재공학과 이수요건
        if self.department.major == "MS":
            major_mandatory.append((["MS212", "MS213", "MS310", "MS311", "MS321", "MS322"], 0))
            if self.department.double_major == "":
                major_mandatory.append((["MS490"], 0))
        if "@MS@" in self.department.double_major:
            major_mandatory.append((["MS212", "MS213", "MS310", "MS311", "MS321", "MS322"], 0))

        # 원자력및양자공학과 이수요건
        if self.department.major == "NQE":
            major_mandatory.append((["NQE201", "NQE202", "NQE203", "NQE204",
                                     "NQE301", "NQE303", "NQE401", "NQE402"], 0))
            if self.department.double_major == "":
                major_mandatory.append((["NQE490"], 0))

        # 융합인재학부 이수요건
        # 아직 개설되지 않은 교과목이 많아 과목 코드를 알 수 없어 보류함.

        # 전기및전자공학부 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "EE":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS201", "MAS109", "MAS202"], 1))
                    major_mandatory.append((["EE490"], 0))
                else:
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 2))
                major_mandatory.append((["EE305", "EE405", "EE201", "EE202", "EE204", "EE209"], 0))
            if "EE" in self.department.minor:
                major_mandatory.append((["EE201", "EE202", "EE204", "EE303", "EE304", "EE305"], 0))
            if "EE" in self.department.double_major:
                major_mandatory.append((["EE305", "EE405", "EE201", "EE202", "EE204", "EE209"], 0))
        elif self.admitted_year <= 2017:
            if self.department.major == "EE":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS201", "MAS109", "MAS202"], 1))
                    major_mandatory.append((["EE490"], 0))
                else:
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 2))
                major_mandatory.append((["EE305", "EE405", "EE201", "EE202", "EE204", "EE209"], 0))
            if "EE" in self.department.minor:
                major_mandatory.append((["EE305"], 0))
            if "EE" in self.department.double_major:
                major_mandatory.append((["EE305", "EE405", "EE201", "EE202", "EE204", "EE209"], 0))
        else:
            if self.department.major == "EE":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS201", "MAS109", "MAS202"], 1))
                    major_mandatory.append((["EE490"], 0))
                else:
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 2))
                major_mandatory.append((["EE305", "EE405"], 0))
                major_mandatory.append((["EE201", "EE202", "EE204", "EE209", "EE210", "EE211"], 3))
            if "EE" in self.department.minor:
                major_mandatory.append((["EE305"], 0))
            if "EE" in self.department.double_major:
                major_mandatory.append((["EE305", "EE405", "EE201", "EE202", "EE204", "EE209", "EE201", "EE211"], 3))

        # 전산학부 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "CS":
                major_mandatory.append((["MAS109"], 0))
                major_mandatory.append((["CS204", "CS206", "CS300", "CS311", "CS320", "CS330"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["CS490", "CS408"], 1))
            if "CS" in self.department.double_major:
                major_mandatory.append((["CS204", "CS206", "CS300", "CS311", "CS320", "CS330"], 0))
        if self.admitted_year >= 2016:
            if self.department.major == "CS":
                major_mandatory.append((["MAS109"], 0))
                major_mandatory.append((["CS204", "CS206", "CS300", "CS311", "CS320", "CS330"], 0))
                if self.admitted_year >= 2020:
                    major_mandatory.append((["CS350", "CS360", "CS374", "CS408", "CS409", "CS423",
                                             "CS442", "CS453", "CS454", "CS457", "CS459", "CS473",
                                             "CS474", "CS482"], 13))
                if self.department.double_major == "":
                    major_mandatory.append((["CS490", "CS408"], 1))
            if "CS" in self.department.double_major:
                major_mandatory.append((["CS204", "CS206", "CS300", "CS311", "CS320", "CS330"], 0))

        # 항공우주공학과 이수요건
        if self.admitted_year <= 2015:
            if self.department.major == "AE":
                if self.department.double_major == "":
                    major_mandatory.append((["MAS109", "MAS201", "MAS202"], 1))
                    major_mandatory.append((["MAE406", "MAE490", "AE490", "AE401"], 3))

                else:
                    major_mandatory.append((["MAS109", "MAS202", "MAS201"], 2))
                major_mandatory.append((["AE210", "MAE210", "MAE211"], 2))
                major_mandatory.append((["AE220", "MAE220", "MAE221"], 2))
                major_mandatory.append((["AE300", "MAE365"], 1))
                major_mandatory.append((["AE208", "AE308", "MAE308"], 2))
                major_mandatory.append((["AE307", "AE309", "MAE309"], 2))
                major_mandatory.append((["AE330", "MAE335"], 1))
                major_mandatory.append((["AE400", "MAE405"], 1))
            if "AE" in self.department.double_major:
                major_mandatory.append((["AE210", "MAE210", "MAE211"], 2))
                major_mandatory.append((["AE220", "MAE220", "MAE221"], 2))
                major_mandatory.append((["AE300", "MAE365"], 1))
                major_mandatory.append((["AE208", "AE308", "MAE308"], 2))
                major_mandatory.append((["AE307", "AE309", "MAE309"], 2))
                major_mandatory.append((["AE330", "MAE335"], 1))
                major_mandatory.append((["AE400", "MAE405"], 1))
        if self.admitted_year >= 2016:
            if self.department.major == "AE":
                major_mandatory.append((["AE208", "AE210", "AE220", "AE300", "AE307", "AE330", "AE400"], 0))
                if self.department.double_major == "":
                    major_mandatory.append((["AE490", "AE401"]))
            if "AE" in self.department.double_major:
                major_mandatory.append((["AE208", "AE210", "AE220", "AE300", "AE307", "AE330", "AE400"], 0))

        # 화학과 이수요건
        if self.department.major == "CH":
            if self.department.double_major == "":
                major_mandatory.append((["CH103", "CH104"], 0))
                major_mandatory.append((["CH490"], 0))
            else:
                major_mandatory.append((["CH103"], 0))
            major_mandatory.append((["CH491", "CH492"], 0))
            major_mandatory.append((["CH211", "CH213", "CH221", "CH223", "CH252", "CH352", "CH353"], 0))
            major_mandatory.append((["CH241", "CH344"], 1))
            major_mandatory.append((["CH263", "CH361"], 1))
        if "CH" in self.department.double_major:
            major_mandatory.append((["CH211", "CH213", "CH221", "CH223", "CH252", "CH352", "CH353"], 0))
            major_mandatory.append((["CH241", "CH344"], 1))
            major_mandatory.append((["CH263", "CH361"], 1))

        # 이수 요건에 충족하였는지 계산
        for course in courses:
            if "@" + str(course.id) + "@" in self.replaced:
                course = Course.query.filter_by(code=course.replaceables()).first()
            for requirement in major_mandatory:
                if ("490" in course.code) and ("490" in requirement[0]):
                    requirement[0].remove(course.code)
                if course.code in requirement[0]:
                    requirement[0].remove(course.code)
                if len(requirement[0]) <= int(requirement[1]):
                    major_mandatory.remove(requirement)

        return general_mandatory, major_mandatory

    def remaining_course_alert(self):
        """
        returns alerts for remaining courses.
        the list of return values consists of tuples that includes
            1) number of currently taken courses
            2) number of left like courses that must be taken
            3) course codes that must be taken for graduation
        if there are no courses left to be taken, returns 'Success' string.
        """
        if not self.valid_department():
            return None

        general_mandatory = self.remaining_courses()[0]
        major_mandatory = self.remaining_courses()[1]
        if len(general_mandatory) + len(major_mandatory) == 0:
            return "Success"

        alerts, others = [], []
        for course in general_mandatory:
            if len(course) < 3:
                course1 = Course.query.filter_by(code=course[0]).first()
                course2 = Course.query.filter_by(code=course[1]).first()
                alerts.append((2, 1, [course1, course2]))
            else:
                others.append(Course.query.filter_by(code=course).first())
        if len(others) > 0:
            alerts.append((len(others), len(others), others))

        for code in major_mandatory:
            courses = []
            for course in code[0]:
                courses.append(Course.query.filter_by(code=course).first())
            alerts.append((len(code[0]), len(code[0]) - code[1], courses))

        return alerts

    def remaining_credit_alert(self):
        happy, exciting, leadership, physical, mg, mb, me, rs, mj, om, hm = self.remaining_credits()
        alerts = {"즐거운 대학생활": 1 if happy != 0 else None, "신나는 대학생활": 1 if exciting != 0 else None,
                  "인성/리더십": leadership if leadership != 0 else None, "체육": physical if physical != 0 else None,
                  "교양필수": mg if mg != 0 else None, "기초필수": mb if mb != 0 else None, "기초선택": me if me != 0 else None,
                  "연구": rs if rs != 0 else None, "전공 교과목": mj[1] if mj[1] != 0 else None,
                  "전공필수": mj[0] if mj[0] != 0 else None, "타학과 전공 교과목": om[1] if om[1] != 0 else None,
                  "타학과 전공필수": om[0] if om[0] != 0 else None, "인문사회선택": hm if hm != 0 else None}

        return alerts

    def check_credit_requirements(self):
        """
        checks whether the credit requirement for graduation is fulfilled.
        Returns
        check_credit_requirements: bool
            True if there are no remaining credit requirements
        """
        return self.render_remaining_total_credits() == 0

    def check_course_requirements(self):
        """
        checks whether the course requirement for graduation is fulfilled.
        Returns
        check_course_requirements: bool
            True if there are no remaining course requirements
        """
        if self.department.is_individually_designed == 1:
            other_majors = []
            for course in self.courses:
                if "@" + str(course.id) + "@" in self.individual:
                    department = course.extract_department(replace=False)
                    if department not in other_majors:
                        other_majors.append(department)
            if len(other_majors) < 2:
                return False
        return len(self.remaining_courses()[0] + self.remaining_courses()[1]) == 0

    def graduate_percent(self):
        """
        renders graduate percentage until so far.
        this percentage is not totally accurate, but implemented for visual fulfillment :)
        Returns
        -------
        percentage: float
            percentage achieved for graduation.
        """
        try:
            remaining = self.render_remaining_total_credits()
            required = self.required_credits()[7]
            percent = round((1 - remaining / max(required, remaining)) * 100,1)
        except TypeError:
            return 0

        try:
            if not self.check_course_requirements():
                percent -= 1
        except TypeError:
            pass

        return max(0, percent)

    def render_replaceables(self):
        """
        renders replaceable courses that can be chosen for requirement calculation.
        Returns
        -------
        render: list
            list of tuples of course codes and code for replaceable courses.
        """
        if not self.valid_department():
            return None
        courses = self.courses
        render = []
        for course in courses:
            if course.extract_department(replace=True) in self.department.major + self.department.double_major:
                replaceable = Course.query.filter_by(code=course.replaceables()).first()
                render.append((course, replaceable))
            elif (course.extract_department(replace=True) == "CE") and ("CE" in self.department.minor):
                replaceable = Course.query.filter_by(code=course.replaceables()).first()
                render.append((course, replaceable))

        return render

    def render_recognizables(self):
        """
        renders recognizable courses that can be chosen for requirement calculation.
        Returns
        -------
        render: list
            list of tuples of course codes and codes for recognizable courses.
        """
        if not self.valid_department():
            return None
        dict_departments = {"MAS": "수리과학과", "PH": "물리학과", "CH": "화학과", "BS": "생명과학과",
                            "ME": "기계공학과", "AE": "항공우주공학과", "EE": "전기및전자공학부", "CE": "건설및환경공학과학과",
                            "CS": "전산학부", "BiS": "바이오및뇌공학과", "CBE": "생명화학공학과", "ID": "산업디자인학과",
                            "IE": "산업및시스템공학과", "MS": "신소재공학과", "NQE": "원자력및양자공학과",
                            "MSB": "기술경영학부", "TS": "융합인재학부"}
        courses = self.courses
        render = []
        for course in courses:
            if "@" + str(course.id) + "@" in self.replaced:
                continue
            availables = []
            recognizables = course.recognizables()
            if recognizables == "None":
                continue
            for recognizable in recognizables:
                if recognizable in self.department.major + self.department.double_major:
                    if (self.department.major in course.code) and (recognizable == self.department.major):
                        pass
                    else:
                        availables.append(dict_departments[recognizable])
            if availables:
                render.append((course, availables))

        return render

    def render_doubly_recognizables(self):
        """
        renders doubly recognizable courses that can be chosen for requirement calculation.
        Returns
        -------
        render: list
            list of tuples of course codes and codes for doubly recognizable courses.
        """
        if not self.valid_department():
            return None
        dict_departments = {"MAS": "수리과학과", "PH": "물리학과", "CH": "화학과", "BS": "생명과학과",
                            "ME": "기계공학과", "AE": "항공우주공학과", "EE": "전기및전자공학부", "CE": "건설및환경공학과학과",
                            "CS": "전산학부", "BiS": "바이오및뇌공학과", "CBE": "생명화학공학과", "ID": "산업디자인학과",
                            "IE": "산업및시스템공학과", "MS": "신소재공학과", "NQE": "원자력및양자공학과",
                            "MSB": "기술경영학부", "TS": "융합인재학부"}
        courses = self.courses
        render = []
        for course in courses:
            availables = []
            if "@" + str(course.id) + "@" in self.replaced:
                continue
            recognizables = course.recognizables()
            if recognizables == "None":
                continue
            course_code = course.extract_department(replace=False)
            if course_code not in recognizables:
                recognizables.append(course_code)
            more_than_two = 0
            ce_in_minor = "CE" if "CE" in self.department.minor else ""
            for recognizable in recognizables:
                if recognizable in self.department.major + self.department.double_major + ce_in_minor:
                    more_than_two += 1
                    availables.append(dict_departments[recognizable])
            if more_than_two >= 2:
                render.append((course, availables))

        return render

    def render_individual(self):
        if not self.valid_department():
            return None

        render = []
        courses = self.courses
        for course in courses:
            if "@" + str(course.id) + "@" in self.replaced:
                if "@" + str(course.id) + "@" in self.individual:
                    self.individual = self.individual.remove("@" + str(course.id) + "@", "")
                    db.session.commit()
                continue
            if "전공" in course.subject_type:
                if self.department.major not in course.code:
                    render.append(course)
        return render


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class Department(db.Model):
    """
    db.Model class that stores choices of departments for each user class
    contains major department, minor/double_major departments and etc.
    Parameters
    ----------
    id, userid: db.Column
    major: db.Column
        string that stores the code for major department
    is_advanced_major: db.Column
        binary integer where 1 for advanced majors and 0 if not
    is_individually_designed: db.Column
        binary integer where 1 if chosen individually designed major and 0 otherwise.
    double_major: db.Column
        string that contains list of double majors of choices
    minor: db.Column
        string that contains list of minors of choice
    """
    id = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer, db.ForeignKey('user.id'))

    major = db.Column(db.String(64))
    is_advanced_major = db.Column(db.Integer)
    is_individually_designed = db.Column(db.Integer)

    double_major = db.Column(db.String(64))
    minor = db.Column(db.String(64))

    def major_name_kr(self):
        """
        renders the department name in Korean.
        Returns
        -------
        major, double_major, minor: str
            names in Korean.
        """
        dict_departments = {"MAS": "수리과학과", "PH": "물리학과", "CH": "화학과", "BS": "생명과학과",
                            "ME": "기계공학과", "AE": "항공우주공학과", "EE": "전기및전자공학부", "CE": "건설및환경공학과학과",
                            "CS": "전산학부", "BiS": "바이오및뇌공학과", "CBE": "생명화학공학과", "ID": "산업디자인학과",
                            "IE": "산업및시스템공학과", "@MS@": "신소재공학과", "NQE": "원자력및양자공학과",
                            "MSB": "기술경영학부", "TS": "융합인재학부"}
        major = '(선택 정보 없음)'
        double = []
        minor = []
        for key in dict_departments:
            if key == self.major:
                major = dict_departments[key]
            elif key in self.double_major:
                double.append(dict_departments[key])
            elif key in self.minor:
                minor.append(dict_departments[key])

        return major, double, minor

    def validate_major(self):
        """
        validates major choices to avoid error raises.
        prevents duplicates of same departments chosen for both minor, double major and major.
        """
        if self.major is None or self.major == "":
            return
        dict_departments = {"MAS": "수리과학과", "PH": "물리학과", "CH": "화학과", "BS": "생명과학과",
                            "ME": "기계공학과", "AE": "항공우주공학과", "EE": "전기및전자공학부", "CE": "건설및환경공학과학과",
                            "CS": "전산학부", "BiS": "바이오및뇌공학과", "CBE": "생명화학공학과", "ID": "산업디자인학과",
                            "IE": "산업및시스템공학과", "MS": "신소재공학과", "NQE": "원자력및양자공학과",
                            "MSB": "기술경영학부", "TS": "융합인재학부"}
        for key in dict_departments:
            if key in self.minor:
                if key in self.double_major:
                    self.minor.replace(key, "")

        db.session.commit()


class Course(db.Model):
    """
    db.Model class that stores courses that are able to be taken for each users.
    a relationship table is defined with users so that each user can query courses that he/she has taken
    or can query for each course the users who have taken it
    Parameters
    ----------
    id: db.Column
    course_id: db.Column
        course id that is identical to the CAIS system (e.g. 09.113)
    department: db.Column
        department that opens the course (e.g. 수리과학과)
    subject_type: db.Column
        type of the subject (e.g. 기초필수)
    code: db.Column
        course code of the subject (e.g. MAS101)
    name: db.Column
        name of the course
    credit: db.Column
        credit of the course. includes 'AU' at the end if AU credit.
    """
    id = db.Column(db.Integer, primary_key=True)
    # userid = db.Column(db.Integer, db.ForeignKey('user.id'))

    course_id = db.Column(db.String(8))
    department = db.Column(db.String(32))
    subject_type = db.Column(db.String(32))
    code = db.Column(db.String(32))
    name = db.Column(db.String(200))
    credit = db.Column(db.String(8))

    def recognizables(self):
        """
        renders departments that can recognize the course
        Returns
        -------
        recognizables: list
        """
        if self.code in ["ME203", "ME301", "ME312", "ME330", "ME351", "ME420",
                         "IE363", "CH211", "CH241"]:
            return ["CE"]

        if self.code in ["CH223", "CH325", "BiS335"]:
            return ["BS"]

        if self.code in ["CH221", "CH263"]:
            return ["CE", "BS"]

        if self.code in ["PH212", "PH221", "PH301", "MAE200", "MAE221", "MAE230", "MAE231",
                         "IE331", "IE341", "IE342", "EE202", "EE204", "PH231", "EE321", "CS206", "CS300"]:
            return ["MAS"]

        if self.code in ["ME221"]:
            return ["CE", "MAS"]

        if self.code in ["ME231"]:
            return ["CE", "MAS", "IE"]

        if self.code in ["CBE471", "EE381"]:
            return ["CE", "IE"]

        if self.code in ["BiS438"]:
            return ["BS", "IE"]

        if self.code in ["CE206", "CE350", "ME200", "ME205", "ME303", "ME208", "ME370", "ME453",
                         "ME460", "MSB230", "PH221", "BiS200", "BiS252", "BiS321", "BiS351", "BiS352", "BiS377",
                         "BiS437", "BiS470", "ID213", "ID216", "ID301", "ID303", "ID304", "ID307", "ID308",
                         "ID309", "ID310", "ID403", "ID407", "BS223", "BS357", "CBE260", "CBE362", "CBE483",
                         "MAS212", "MAS241", "MAS242", "MAS270", "MAS275", "MAS311", "MAS365", "MAS475", "MAS476",
                         "MS481", "MS635", "NQE201", "NQE202", "NQE272", "NQE281", "EE201", "EE202", "EE204", "EE303",
                         "EE304", "EE206", "EE305", "EE312", "EE321", "EE324", "EE342", "EE372", "EE411",
                         "EE414", "EE421", "CS204", "CS211", "CS230", "CS310", "CS320", "CS322", "CS341", "CS350",
                         "CS370", "CS376", "CS380", "CS402", "CS440", "CS470", "MAE230"]:
            return ["IE"]

        return "None"

    def replaceables(self):
        """
        renders courses that can replace the course
        Returns
        -------
        replaceable: str
        """
        if self.code == "ME221":
            return "AE210"
        if self.code == "ME231":
            return "AE230"
        if self.code == "ME311":
            return "AE311"
        if self.code == "ME301":
            return "AE370"
        if self.code == "MAS275":
            return "CS204"
        if self.code == "EE312":
            return "CS311"
        if self.code == "CH221":
            return "CBE203"
        if self.code == "BS209":
            return "CBE260"
        if self.code == "CH213":
            return "CBE303"
        if self.code == "BiS438":
            return "CBE362"
        if self.code == "CH211":
            return "CBE404"
        if self.code == "BiS622":
            return "CBE567"
        if self.code == "MAE633":
            return "CBE653"
        if self.code == "MS654":
            return "CBE712"
        if self.code == "BS760":
            return "CBE861"
        if self.code == "IE362":
            return "IE260"
        if self.code == "IE442":
            return "IE343"
        if self.code == "IE641":
            return "IE541"
        if self.code == "CS206":
            return "IE260"

        return "None"

    def extract_department(self, replace=False):
        """
        extracts the department name when a course code is given
        Returns
        -------
        code: str
        """
        if not replace:
            code = self.code
        if replace:
            code = self.replaceables()
        try:
            for i in range(10):
                code = code.replace(str(i), "")
        except NameError:
            return None
        return code