export const SET_TIMETABLES = 'SET_TIMETABLES';
export const CLEAR_TIMETABLES = 'CLEAR_TIMETABLES';
export const SET_CURRENT_TIMETABLE = 'SET_CURRENT_TIMETABLE';
export const CREATE_TIMETABLE = 'CREATE_TIMETABLE';
export const DELETE_TIMETABLE = 'DELETE_TIMETABLE';
export const DUPLICATE_TIMETABLE = 'DUPLICATE_TIMETABLE';
export const ADD_LECTURE_TO_TIMETABLE = 'ADD_LECTURE_TO_TIMETABLE';
export const REMOVE_LECTURE_FROM_TIMETABLE = 'REMOVE_LECTURE_FROM_TIMETABLE';
export const UPDATE_CELL_SIZE = 'UPDATE_CELL_SIZE';
export const SET_IS_DRAGGING = 'SET_IS_DRAGGING';
export const SET_MOBILE_SHOW_TIMETABLE_TABS = 'SET_MOBILE_SHOW_TIMETABLE_TABS';

export function addLectureToTimetable(lecture) {
    return {
        type: ADD_LECTURE_TO_TIMETABLE,
        lecture: lecture,
    };
}

export function removeLectureFromTimetable(lecture) {
    return {
        type: REMOVE_LECTURE_FROM_TIMETABLE,
        lecture: lecture,
    };
}

export function setTimetables(timetables) {
    return {
        type: SET_TIMETABLES,
        timetables: timetables,
    };
}

export function clearTimetables() {
    return {
        type: CLEAR_TIMETABLES,
    };
}

export function setCurrentTimetable(timetable) {
    return {
        type: SET_CURRENT_TIMETABLE,
        timetable: timetable,
    };
}

export function createTimetable(id) {
    return {
        type: CREATE_TIMETABLE,
        id: id,
    };
}

export function deleteTimetable(timetable) {
    return {
        type: DELETE_TIMETABLE,
        timetable: timetable,
    };
}

export function duplicateTimetable(id, timetable) {
    return {
        type: DUPLICATE_TIMETABLE,
        id: id,
        timetable: timetable,
    };
}

export function updateCellSize(width, height) {
    return {
        type: UPDATE_CELL_SIZE,
        width: width,
        height: height,
    };
}

export function setIsDragging(isDragging) {
    return {
        type: SET_IS_DRAGGING,
        isDragging: isDragging,
    };
}

export function setMobileShowTimetableTabs(mobileShowTimetableTabs) {
    return {
        type: SET_MOBILE_SHOW_TIMETABLE_TABS,
        mobileShowTimetableTabs: mobileShowTimetableTabs,
    };
}