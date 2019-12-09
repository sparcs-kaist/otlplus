export const SET_LECTURE_ACTIVE = 'SET_LECTURE_ACTIVE';
export const CLEAR_LECTURE_ACTIVE = 'CLEAR_LECTURE_ACTIVE';
export const SET_MULTIPLE_DETAIL = 'SET_MULTIPLE_DETAIL';
export const CLEAR_MULTIPLE_DETAIL = 'CLEAR_MULTIPLE_DETAIL';

export function setLectureActive(lecture, from, clicked) {
    return {
        type: SET_LECTURE_ACTIVE,
        lecture: lecture,
        from: from,
        clicked: clicked,
    };
}

export function clearLectureActive() {
    return {
        type: CLEAR_LECTURE_ACTIVE,
    };
}

export function setMultipleDetail(title, multipleDetail) {
    return {
        type: SET_MULTIPLE_DETAIL,
        title: title,
        multipleDetail: multipleDetail,
    };
}

export function clearMultipleDetail() {
    return {
        type: CLEAR_MULTIPLE_DETAIL,
    };
}