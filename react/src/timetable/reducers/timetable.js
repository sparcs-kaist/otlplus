import { ADD_LECTURE_TO_TIMETABLE, UPDATE_CELL_SIZE } from '../actions/index';

const initialState = {
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
                type_en: "Basic Required"
            },
        ],
    },
    cellWidth : 0,
    cellHeight : 0,
};

export const timetable = (state = initialState, action) => {
    switch (action.type) {
        case ADD_LECTURE_TO_TIMETABLE:
            return Object.assign({}, state, {
                currentTimetable : [
                    ...state.currentTimetable,
                    action.lecture,
                ],
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