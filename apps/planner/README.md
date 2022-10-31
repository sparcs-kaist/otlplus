# 기능 제안
- OTL 검색 placeholder "검색" => "과목명이나 교수님 성함을 입력하세요"

lecture가 더 specific, course는 교수님 이름 정도는 가지고 있음


- User model
    - 학번(입학년도)
    - 전공
        - type
        - 주전공; major는 정확히 1개!
        - 부전공; minor는 list
        - 심화전공 - 유무(true면 주전공을 가져가서 사용)
        - 복수전공 - 여러개 가능(주전공 길이에 따라 자동으로 판단)
        - 융합전공 - 유무(일반)
    - 구현
        - major : Department // must exist
        - minor : Set(Department) // unique to others
        - specialize : Set(Department) // specialize is subset of (major | double)
        - double : Set(Department) // double & (major | minor) = empty
        - self_designed : `Boolean` // if true, (minor | specialize | double) = empty
    - special case
        <!-- - 심전 2개 가능? - 학사시스템 구현 상 유무로 되어있어서 따라하기 : 지윤 누나의 뇌피셜... -->
        - 부전 + 복전? - 주전, 복전, 부전
        - 심전 + 부전? - 주전을 심전, 부전
        - 융전 + 부전?
        - 주전 + 복전인데 복전을 심전?? syntactic sugar... 주전을 심전하자...
        - 문화기술대학원, 경제학부전공 `등`은 부전만 가능
        - 새내기과정학부는 major만 가능; default로 하자!
        - 
    - function API
        - TrackType = "major" | "minor" | "specialized" | "double" | "self_designed"
            - 졸업을 위해서는 TrackType이 major일 순 없다; track을 선택을 해야 졸업이 되니까
            - 근데 major만 해도 기필 같은 거 들었는지 확인 정도는 가능!
            - 없애자!
        <!-- - getTrackType() : TrackType -->
        - getTrack() : Track
            - TrackType에 따라서 Track이 달라
        - isTrackSelected() : Boolean
            - Track을 선택했는지 알려준다; 예를 들어 새내기는 없을 수도!
            - track을 선택을 해야만 졸업이 되는데 major만 선택해도 기필 같은 거 들었는지 확인 정도는 가능!
            - isTrackSelected() == true <=> major != 새내기과정학부; 그래서 새내기과정학부는 default이고 default로만 사용가능
- Course
    - special case
        - unique의 기준은?
            - 일부 특강 혹은 리3 같은 경우 부제가 다른 경우가 있다
            - 기준은 수강이 간
        - 특강
            - 정의
                - 과목번호(PH489), 전산코드(20.489)은 같으나 과목명이 다른 경우
            - 문제
                - Course와 unique의 정의에 따라 문제가 되지 않을 수도 있으나 다음과 같은 상황으로 인해 문제로 정의하였다
                - 과목번호와 전산코드가 같지만 같은 학기(또는 다른 학기)에 수강이 가능하다
                    - 수강신청을 하는 경우에도 한 부제를 신청한 경우 다른 부제는 예외신청으로만 가능하다
                    - 이를 쉽게 해결하기 위해 cais에서도 하지 않지만 내부적으로 구분가능하도록 uuid를 만들어야 한다
                    - 따라서 특강은 서로 다른 Course로 생성되어야하나 과목번호와 전산코드는 도움을 줄 수 없다
            - 사례
                - 전산학특강, 사회학특강, 리3
        - 재수강
            - 정의
                - C+ 이하 성적을 받으면 재수강 선택 가능
                - 필수과목(기필 / 전필 / 전공을 위한 기선) 에서 F/U이면 재수강 필수
            - 문제
                - 재수강하는 경우 이전 학점이 들어가지 않는다
                - 전체 학기에 수강한 과목을 얻을 때 unique하지 않다
                    - unique함을 사용하지 않거나 재수강의 경우 사전에 제외하여 적용
            - 사례
                - 현재 2학기인데 1학기에 F받아서 3학기에 재수강하려고 한다
                - 이 경우 1학기에 수강하였지만 3학기에 다시 수강하고자 할 수 있다
        - 상호인정
            - 정의
                - 전자과 과목인데 전산과목으로도 인정이 되어서 전필/전산 학점에 추가되어야 할 수 있다
            - 문제
                - 일부 과목에 해당되는 경우이기 때문에 잊지말고 전공 별 학점 계산시 반영해야 한다
            - 사례
                - 이산수학을 수강하면 이산구조로 수강 인정이 된다
        - HP(honor program)
            - 정의
                - 대학원 과목은 500번대 이상을 말한다
                - 500번대는 학부생이 들을 수 있으나 600번대 이상은 원래 막혀있다
                - 학점과 평점(GPA) 조건을 만족한 학부생이 신청하면 HP를 할 수 있다
            - 문제
                - 일부 사용자에게만 적용되는 사례라서 잊어버리기 좋으니 잘 처리해야 한다
        - 기이수(AP)
            - 정의
                - 일부 고등학교에서 KAIST 학점을 받으면서 과목을 수강하는 경우가 있다
                - 대학교 학점으로 인정이 된다.
            - 문제
                - 일부 사용자에게만 적용되는 사례라서 잊어버리기 좋으니 잘 처리해야 한다
                - 과목번호와 교과목이 주어진다
                - 일부 과목의 경우 자선으로 들어가며 대응과목이 없어 고유한 과목번호과 교과목을 사용한다
                - 대응과목이 있는 경우 대응 과목의 과목번호와 교과목을 사용하나 학과는 상이하다
            - 사례
                - 한국과학영재학교 개별AP	20.141	PH141		기필	일반물리학 I	3.0	0	N	S	General Physics I
                - 한국과학영재학교 개별AP	36.204	CS204		전필	이산구조	3.0	0	N	A0	Discrete Mathematics
        - 영어
            - 정의
                - 레벨테스트 결과 혹은 공인성적에 따라 등급이 주어진다
            - 문제
                - 영어 레벨테스트 결과에 따라 영어 필수과목 일부가 기이수 처리된다
                - 그런데 일부에게는 basic이란 필수과목이 추가된다(basic!)
                    - 학사시스템에서 검색되지 않으니 주의해야 한다
                    - string으로 직접 처리해서 사용자에게 알려주어야 할 것 같다
        - 논글 등급제
            - 정의
                - 레벨테스트 결과에 따라 논술등급이 주어진다
                - 주어진 등급에 따라 수강해야 하는 과목의 종류와 수가 달라진다
                - A등급은 두 과목 면제
                - B등급은 글쓰기의 기초는 면제되며 논리적 글쓰기 수강해야 한다
                - C등급은 글쓰기의 기초는 수강 후 논리적 글쓰기 수강해야 한다
            - 문제
                - 등급에 따라 추가로 수강해야 하는 과목이 생긴다; 따라서 사람마다 교양 필수 과목이 다르다고 할 수 있다
                - 이를 기이수로 처리할 수 없는 이유는 다음과 같다
                    - 글쓰기의 기초는 면제가 되어도 학점을 받지 않지 않기 때문에 글쓰기의 기초가 면제되더라도 추가 학점이 생기지 않는다
        - 체육
        - 인문선택 회화 과목
            - 정의:인문선택 회화 과목이란 인문선택 과목 중 '회화'란 단어가 포함되는 경우를 말한다
            - 문제: 입학 시기에 따라 인문선택이 아닌 자유선택으로 인정될 수 있다
            - 사례: 일본어회화, 스페인어회화
        - 특기자전형
            - 정의: 특기자전형으로 입학하면 기필을 최소 12학점만 듣고 나머지 기필은 기선으로 돌릴 수 있다
            - 문제: 기필을 다 듣지 않아도 졸업이 가능하다
            - 사례. 일물2를 듣지 않고, 기존 기선 조건(6학점)을 모두 만족한 후 추가로 확통을 들을 경우 졸업이 가능하다
        - 전필
            - 정의: 전필 조건이 fixed set이 아니라 n개 중 m개 이상 혹은 n학점 중 m학점 이상으로 주어지는 학과들이 있다
            - 문제: 특정 사용자에게만 적용될 수 있으니 학과별 요건 계산 시 주의해야 한다
        - 인문선택 계열
            - 정의: 전공 트랙에 따라 들어야 하는 인문선택 분류 조건이 달라진다
            - 문제: 인문선택 졸업요건을 확인할 때 단순히 학점을 더하기만 하면 되는 게 아니라 계열도 따져야 한다 (문학/예술/사회 계열)
            - 사례
                - 복전의 경우 분류 무관하게 4개를 들으면 되지만, 부전의 경우 서로 다른 2개의 분류에서 각각 2과목 이상씩 들어야 한다
                - 입학연도에 따라 적용되는 계열이 다른 경우도 있었던 것 같다(??) - 예를 들어 원래는 예술 계열이었는데 나중 입학생에게는 사회 계열로 적용된다던가.. 뭐 대충 그런 게 있었는데 기억이 잘 안난다
        - 국제학생
            - 정의: 한국인/외국인 여부에 따라 들어야 하는 과목이 다르다
            - 문제: 사용자의 국적을 받아와야 할 필요성이 있다.
            - 사례: 외국인은 한국어 과목을 들어야 한다.
    - 구현
        - unique id : 
        - old_code = models.CharField(max_length=10, db_index=True)
    department = models.ForeignKey("Department", on_delete=models.PROTECT, db_index=True)
    professors = models.ManyToManyField("Professor", db_index=True)
    type = models.CharField(max_length=12)
    type_en = models.CharField(max_length=36)
    title = models.CharField(max_length=100, db_index=True)
    title_en = models.CharField(max_length=200, db_index=True)

    # Updated by command update_course_summary
    summury = models.CharField(max_length=4000, default="")

    related_courses_prior = models.ManyToManyField("Course", related_name="+")
    related_courses_posterior = models.ManyToManyField("Course", related_name="+")

    # Updated by view when reviews are added/deleted/modified
    grade_sum = models.FloatField(default=0)
    load_sum = models.FloatField(default=0)
    speech_sum = models.FloatField(default=0)
    review_total_weight = models.FloatField(default=0)
    grade = models.FloatField(default=0.0)
    load = models.FloatField(default=0.0)
    speech = models.FloatField(default=0.0)

    latest_written_datetime = models.DateTimeField(default=None, null=True)

~~디노는 귀여워요 히히~~

https://pdf2md.morethan.io/
https://github.com/jzillmann/pdf-to-markdown

| 1   | 2   |     | 6   |
| --- | --- | --- | --- |
|     |     | 5   |     |

- TODO
  - [x] docs => markdown
  - [ ] markdown 가독성 높이기
  - [ ] api 형태를 정하기
    - [ ] planner scheme
    - [ ] 기존 코드 읽어보기, 살릴 곳 정하기
    - [ ] 매화수 코드 읽어보기, 살릴 곳 정하기