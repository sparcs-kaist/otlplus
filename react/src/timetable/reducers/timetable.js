import { SET_TIMETABLES, SET_CURRENT_TIMETABLE, CREATE_TIMETABLE, DELETE_TIMETABLE, DUPLICATE_TIMETABLE, ADD_LECTURE_TO_TIMETABLE, REMOVE_LECTURE_FROM_TIMETABLE, UPDATE_CELL_SIZE } from '../actions/index';

const initialState = {
    timetables : [
        {
            id: 12,
            lectures: [
                {
                    load: 12,
                    code: "36.101",
                    grade: 12,
                    credit_au: 0,
                    semester: 1,
                    is_english: true,
                    year: 2018,
                    classtimes: [
                        {
                            building: "E11",
                            classroom: "(E11) 창의학습관 308",
                            begin: 540,
                            end: 720,
                            room: "308",
                            classroom_short: "(E11) 308",
                            day: 0
                        },
                        {
                            building: "E11",
                            classroom: "(E11) 창의학습관 103",
                            begin: 630,
                            end: 750,
                            room: "103",
                            classroom_short: "(E11) 103",
                            day: 1
                        }
                    ],
                    limit: 45,
                    classroom_short: "(E11) 308",
                    common_title: "프로그래밍기초",
                    professor_short: "김문주",
                    class_no: "B",
                    title: "프로그래밍기초",
                    speech_letter: "A",
                    old_code: "CS101",
                    id: 989349,
                    speech: 14.25,
                    department: 4421,
                    department_code: "CS",
                    type: "기초필수",
                    examtimes: [
                        {
                            begin: 1140,
                            end: 1305,
                            day: 0,
                            str: "월요일 19:00 ~ 21:45"
                        }
                    ],
                    building: "E11",
                    exam: "월요일 19:00 ~ 21:45",
                    class_title: "B",
                    num_people: 26,
                    course: 744,
                    load_letter: "B+",
                    classroom: "(E11) 창의학습관 308",
                    room: "308",
                    has_review: true,
                    professor: "김문주",
                    department_name: "전산학부",
                    credit: 3,
                    grade_letter: "B+",
                    type_en: "Basic Required",
                    reviews: [{
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
        },
        {
            id: 23,
            lectures: [
                {
                    load: 12,
                    code: "36.101",
                    grade: 12,
                    credit_au: 0,
                    semester: 1,
                    is_english: true,
                    year: 2018,
                    classtimes: [
                        {
                            building: "E11",
                            classroom: "(E11) 창의학습관 308",
                            begin: 540,
                            end: 720,
                            room: "308",
                            classroom_short: "(E11) 308",
                            day: 0
                        },
                        {
                            building: "E11",
                            classroom: "(E11) 창의학습관 103",
                            begin: 630,
                            end: 750,
                            room: "103",
                            classroom_short: "(E11) 103",
                            day: 1
                        }
                    ],
                    limit: 45,
                    classroom_short: "(E11) 308",
                    common_title: "프로그래밍기초",
                    professor_short: "김문주",
                    class_no: "B",
                    title: "프로그래밍기초",
                    speech_letter: "A",
                    old_code: "CS101",
                    id: 989349,
                    speech: 14.25,
                    department: 4421,
                    department_code: "CS",
                    type: "기초필수",
                    examtimes: [
                        {
                            begin: 1140,
                            end: 1305,
                            day: 0,
                            str: "월요일 19:00 ~ 21:45"
                        }
                    ],
                    building: "E11",
                    exam: "월요일 19:00 ~ 21:45",
                    class_title: "B",
                    num_people: 26,
                    course: 744,
                    load_letter: "B+",
                    classroom: "(E11) 창의학습관 308",
                    room: "308",
                    has_review: true,
                    professor: "김문주",
                    department_name: "전산학부",
                    credit: 3,
                    grade_letter: "B+",
                    type_en: "Basic Required",
                    reviews: [{
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
        },
        {
            id: 34,
            lectures: [
            ],
        }
    ],
    currentTimetable : {
        id: 12,
        lectures: [
            {
                load: 12,
                code: "36.101",
                grade: 12,
                credit_au: 0,
                semester: 1,
                is_english: true,
                year: 2018,
                classtimes: [
                    {
                        building: "E11",
                        classroom: "(E11) 창의학습관 308",
                        begin: 540,
                        end: 720,
                        room: "308",
                        classroom_short: "(E11) 308",
                        day: 0
                    },
                    {
                        building: "E11",
                        classroom: "(E11) 창의학습관 103",
                        begin: 630,
                        end: 750,
                        room: "103",
                        classroom_short: "(E11) 103",
                        day: 1
                    }
                ],
                limit: 45,
                classroom_short: "(E11) 308",
                common_title: "프로그래밍기초",
                professor_short: "김문주",
                class_no: "B",
                title: "프로그래밍기초",
                speech_letter: "A",
                old_code: "CS101",
                id: 989349,
                speech: 14.25,
                department: 4421,
                department_code: "CS",
                type: "기초필수",
                examtimes: [
                    {
                        begin: 1140,
                        end: 1305,
                        day: 0,
                        str: "월요일 19:00 ~ 21:45"
                    }
                ],
                building: "E11",
                exam: "월요일 19:00 ~ 21:45",
                class_title: "B",
                num_people: 26,
                course: 744,
                load_letter: "B+",
                classroom: "(E11) 창의학습관 308",
                room: "308",
                has_review: true,
                professor: "김문주",
                department_name: "전산학부",
                credit: 3,
                grade_letter: "B+",
                type_en: "Basic Required",
                reviews: [{
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
    },
    cellWidth : 0,
    cellHeight : 0,
};

export const timetable = (state = initialState, action) => {
    switch (action.type) {
        case SET_TIMETABLES:
            return Object.assign({}, state, {
                timetables : action.timetables,
                currentTimetable : action.timetables[0],
            });
        case SET_CURRENT_TIMETABLE:
            return Object.assign({}, state, {
                currentTimetable : action.timetable,
            });
        case CREATE_TIMETABLE:
            let newTable = {
                id : action.id,
                lectures : [],
            };
            return Object.assign({}, state, {
                currentTimetable : newTable,
                timetables : [
                    ...state.timetables,
                    newTable,
                ],
            });
        case DELETE_TIMETABLE:
            let newTables = state.timetables.filter((timetable)=>(timetable.id!==action.timetable.id));
            return Object.assign({}, state, {
                currentTimetable : newTables[0],
                timetables : newTables,
            });
        case DUPLICATE_TIMETABLE:
            newTable = {
                id : action.id,
                lectures : action.timetable.lectures.slice(),
            };
            return Object.assign({}, state, {
                currentTimetable: newTable,
                timetables: [
                    ...state.timetables,
                    newTable
                ],
            });
        case ADD_LECTURE_TO_TIMETABLE:
            newTable = {
                id : state.currentTimetable.id,
                lectures : state.currentTimetable.lectures.concat([action.lecture]),
            };
            newTables = state.timetables.map((timetable)=>(
                timetable.id===newTable.id
                ? newTable
                : timetable
            ));
            for (let i=0; i<newTables.length; i++)
                if (newTables[i].id===state.currentTimetable.id)
                    newTables[i] = newTable;
            return Object.assign({}, state, {
                currentTimetable: newTable,
                timetables: newTables,
            });
        case REMOVE_LECTURE_FROM_TIMETABLE:
            newTable = {
                id : state.currentTimetable.id,
                lectures : state.currentTimetable.lectures.slice().filter((lecture)=>(lecture.id!==action.lecture.id)),
            };
            newTables = state.timetables.map((timetable)=>(
                timetable.id===newTable.id
                    ? newTable
                    : timetable
            ));
            return Object.assign({}, state, {
                currentTimetable: newTable,
                timetables: newTables,
            });
        case UPDATE_CELL_SIZE:
            return Object.assign({}, state, {
                cellWidth : action.width,
                cellHeight : action.height,
            });

        default:
            return state;
    }
};