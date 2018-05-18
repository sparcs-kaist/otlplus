import { FETCH_SEARCH } from '../actions/index';

const initialState = {
    courses : [
        [
            {
                "load": 12,
                "code": "36.101",
                "grade": 12,
                "credit_au": 0,
                "semester": 1,
                "is_english": true,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "E11",
                        "classroom": "(E11) 창의학습관 307",
                        "begin": 540,
                        "end": 720,
                        "room": "307",
                        "classroom_short": "(E11) 307",
                        "day": 0
                    },
                    {
                        "building": "E11",
                        "classroom": "(E11) 창의학습관 103",
                        "begin": 630,
                        "end": 750,
                        "room": "103",
                        "classroom_short": "(E11) 103",
                        "day": 1
                    }
                ],
                "limit": 45,
                "classroom_short": "(E11) 307",
                "common_title": "프로그래밍기초",
                "professor_short": "김문주",
                "class_no": "A",
                "title": "프로그래밍기초",
                "speech_letter": "A",
                "old_code": "CS101",
                "id": 989348,
                "speech": 14.25,
                "department": 4421,
                "department_code": "CS",
                "type": "기초필수",
                "examtimes": [
                    {
                        "begin": 1140,
                        "end": 1305,
                        "day": 0,
                        "str": "월요일 19:00 ~ 21:45"
                    }
                ],
                "building": "E11",
                "exam": "월요일 19:00 ~ 21:45",
                "class_title": "A",
                "num_people": 35,
                "course": 744,
                "load_letter": "B+",
                "classroom": "(E11) 창의학습관 307",
                "room": "307",
                "has_review": true,
                "professor": "김문주",
                "department_name": "전산학부",
                "credit": 3,
                "grade_letter": "B+",
                "type_en": "Basic Required",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            },{
                "load": 12,
                "code": "36.101",
                "grade": 12,
                "credit_au": 0,
                "semester": 1,
                "is_english": true,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "E11",
                        "classroom": "(E11) 창의학습관 308",
                        "begin": 540,
                        "end": 720,
                        "room": "308",
                        "day": 0,
                        "classroom_short": "(E11) 308"
                    },
                    {
                        "building": "E11",
                        "classroom": "(E11) 창의학습관 103",
                        "begin": 630,
                        "end": 750,
                        "room": "103",
                        "day": 1,
                        "classroom_short": "(E11) 103"
                    }
                ],
                "id": 989349,
                "common_title": "프로그래밍기초",
                "professor_short": "김문주",
                "class_no": "B",
                "title": "프로그래밍기초",
                "speech_letter": "A",
                "old_code": "CS101",
                "classroom_short": "(E11) 308",
                "speech": 14.25,
                "department": 4421,
                "department_code": "CS",
                "type": "기초필수",
                "grade_letter": "B+",
                "examtimes": [
                    {
                        "begin": 1140,
                        "end": 1305,
                        "day": 0,
                        "str": "월요일 19:00 ~ 21:45"
                    }
                ],
                "classroom": "(E11) 창의학습관 308",
                "exam": "월요일 19:00 ~ 21:45",
                "class_title": "B",
                "has_review": true,
                "num_people": 26,
                "load_letter": "B+",
                "building": "E11",
                "room": "308",
                "course": 744,
                "professor": "김문주",
                "department_name": "전산학부",
                "credit": 3,
                "limit": 45,
                "type_en": "Basic Required",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            }
        ],
        [
            {
                "load": 14.6666666666667,
                "code": "36.204",
                "grade": 13,
                "credit_au": 0,
                "semester": 1,
                "is_english": true,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "E3",
                        "classroom": "(E3) 정보전자공학동 1501(제1공동강의실)",
                        "begin": 780,
                        "end": 870,
                        "room": "1501(제1공동강의실)",
                        "classroom_short": "(E3) 1501(제1공동강의실)",
                        "day": 0
                    },
                    {
                        "building": "E3",
                        "classroom": "(E3) 정보전자공학동 1501(제1공동강의실)",
                        "begin": 780,
                        "end": 870,
                        "room": "1501(제1공동강의실)",
                        "classroom_short": "(E3) 1501(제1공동강의실)",
                        "day": 2
                    }
                ],
                "limit": 60,
                "classroom_short": "(E3) 1501(제1공동강의실)",
                "common_title": "이산구조",
                "professor_short": "강성원",
                "class_no": "A",
                "title": "이산구조",
                "speech_letter": "A-",
                "old_code": "CS204",
                "id": 989049,
                "speech": 12.6666666666667,
                "department": 4421,
                "department_code": "CS",
                "type": "전공필수",
                "examtimes": [
                    {
                        "begin": 780,
                        "end": 945,
                        "day": 0,
                        "str": "월요일 13:00 ~ 15:45"
                    }
                ],
                "building": "E3",
                "exam": "월요일 13:00 ~ 15:45",
                "class_title": "A",
                "num_people": 99,
                "course": 745,
                "load_letter": "A+",
                "classroom": "(E3) 정보전자공학동 1501(제1공동강의실)",
                "room": "1501(제1공동강의실)",
                "has_review": true,
                "professor": "강성원",
                "department_name": "전산학부",
                "credit": 3,
                "grade_letter": "A-",
                "type_en": "Major Required",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            },
            {
                "load": 13,
                "code": "36.204",
                "grade": 13.5,
                "credit_au": 0,
                "semester": 1,
                "is_english": true,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 102",
                        "begin": 870,
                        "end": 960,
                        "room": "102",
                        "classroom_short": "(N1) 102",
                        "day": 1
                    },
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 102",
                        "begin": 870,
                        "end": 960,
                        "room": "102",
                        "classroom_short": "(N1) 102",
                        "day": 3
                    }
                ],
                "limit": 60,
                "classroom_short": "(N1) 102",
                "common_title": "이산구조",
                "professor_short": "박진아",
                "class_no": "B",
                "title": "이산구조",
                "speech_letter": "A",
                "old_code": "CS204",
                "id": 989050,
                "speech": 14.25,
                "department": 4421,
                "department_code": "CS",
                "type": "전공필수",
                "examtimes": [
                    {
                        "begin": 780,
                        "end": 945,
                        "day": 3,
                        "str": "목요일 13:00 ~ 15:45"
                    }
                ],
                "building": "N1",
                "exam": "목요일 13:00 ~ 15:45",
                "class_title": "B",
                "num_people": 128,
                "course": 745,
                "load_letter": "A-",
                "classroom": "(N1) 김병호·김삼열 IT융합빌딩 102",
                "room": "102",
                "has_review": true,
                "professor": "박진아",
                "department_name": "전산학부",
                "credit": 3,
                "grade_letter": "A",
                "type_en": "Major Required",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            },
            {
                "load": 12,
                "code": "36.204",
                "grade": 15,
                "credit_au": 0,
                "semester": 1,
                "is_english": true,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 112",
                        "begin": 870,
                        "end": 960,
                        "room": "112",
                        "classroom_short": "(N1) 112",
                        "day": 1
                    },
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 112",
                        "begin": 870,
                        "end": 960,
                        "room": "112",
                        "classroom_short": "(N1) 112",
                        "day": 3
                    }
                ],
                "limit": 60,
                "classroom_short": "(N1) 112",
                "common_title": "이산구조",
                "professor_short": "마틴 지글러",
                "class_no": "C",
                "title": "이산구조",
                "speech_letter": "A+",
                "old_code": "CS204",
                "id": 1140744,
                "speech": 15,
                "department": 4421,
                "department_code": "CS",
                "type": "전공필수",
                "examtimes": [
                    {
                        "begin": 780,
                        "end": 945,
                        "day": 3,
                        "str": "목요일 13:00 ~ 15:45"
                    }
                ],
                "building": "N1",
                "exam": "목요일 13:00 ~ 15:45",
                "class_title": "C",
                "num_people": 49,
                "course": 745,
                "load_letter": "B+",
                "classroom": "(N1) 김병호·김삼열 IT융합빌딩 112",
                "room": "112",
                "has_review": true,
                "professor": "마틴 지글러",
                "department_name": "전산학부",
                "credit": 3,
                "grade_letter": "A+",
                "type_en": "Major Required",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            },
        ],
        [
            {
                "load": 12.2571428571429,
                "code": "36.211",
                "grade": 14.8285714285714,
                "credit_au": 0,
                "semester": 1,
                "is_english": false,
                "year": 2018,
                "classtimes": [
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 201",
                        "begin": 780,
                        "end": 870,
                        "room": "201",
                        "classroom_short": "(N1) 201",
                        "day": 1
                    },
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 317",
                        "begin": 1140,
                        "end": 1320,
                        "room": "317",
                        "classroom_short": "(N1) 317",
                        "day": 1
                    },
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 317",
                        "begin": 1140,
                        "end": 1320,
                        "room": "317",
                        "classroom_short": "(N1) 317",
                        "day": 2
                    },
                    {
                        "building": "N1",
                        "classroom": "(N1) 김병호·김삼열 IT융합빌딩 201",
                        "begin": 780,
                        "end": 870,
                        "room": "201",
                        "classroom_short": "(N1) 201",
                        "day": 3
                    }
                ],
                "limit": 60,
                "classroom_short": "(N1) 201",
                "common_title": "디지탈시스템 및 실험",
                "professor_short": "맹승렬",
                "class_no": "",
                "title": "디지탈시스템 및 실험",
                "speech_letter": "A",
                "old_code": "CS211",
                "id": 989053,
                "speech": 13.7142857142857,
                "department": 4421,
                "department_code": "CS",
                "type": "전공선택",
                "examtimes": [
                    {
                        "begin": 780,
                        "end": 945,
                        "day": 1,
                        "str": "화요일 13:00 ~ 15:45"
                    }
                ],
                "building": "N1",
                "exam": "화요일 13:00 ~ 15:45",
                "class_title": "A",
                "num_people": 83,
                "course": 752,
                "load_letter": "B+",
                "classroom": "(N1) 김병호·김삼열 IT융합빌딩 201",
                "room": "201",
                "has_review": true,
                "professor": "맹승렬",
                "department_name": "전산학부",
                "credit": 4,
                "grade_letter": "A+",
                "type_en": "Major Elective",
                "reviews": [{
                    id:1,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                },{
                    id:2,
                    body:"핀토스, 오디세우스와 함께 전산 플젝 3대장 켄스 플젝이 있는 네트워크입니다. 전산과생이라면 꼭 들어야 하는 강의라 생각하고 실제 배우는 것도 많습니다. 교수님 강의력도\n" +
                    "                        훌륭하고 학점도 잘 주십니다. 핀토스나 오디세우스를 짜 본 분이라면 켄스는 아주 쉽게 느껴질 거에요.",
                    score:"A",
                    load:"B",
                    speech:"C",
                    recommend:10
                }],
            }
        ]
    ],
};

export const list = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_SEARCH:
            return Object.assign({}, state, {
                courses : action.courses,
            });
        default:
            return state;
    }
};