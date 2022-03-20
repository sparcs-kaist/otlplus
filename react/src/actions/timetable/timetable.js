const BASE_STRING = 'T_T_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_TIMETABLES = BASE_STRING + 'SET_TIMETABLES';
export const CLEAR_TIMETABLES = BASE_STRING + 'CLEAR_TIMETABLES';
export const SET_MY_TIMETABLE_LECTURES = BASE_STRING + 'SET_MY_TIMETABLE_LECTURES';
export const SET_SELECTED_TIMETABLE = BASE_STRING + 'SET_SELECTED_TIMETABLE';
export const CREATE_TIMETABLE = BASE_STRING + 'CREATE_TIMETABLE';
export const DELETE_TIMETABLE = BASE_STRING + 'DELETE_TIMETABLE';
export const DUPLICATE_TIMETABLE = BASE_STRING + 'DUPLICATE_TIMETABLE';
export const ADD_LECTURE_TO_TIMETABLE = BASE_STRING + 'ADD_LECTURE_TO_TIMETABLE';
export const REMOVE_LECTURE_FROM_TIMETABLE = BASE_STRING + 'REMOVE_LECTURE_FROM_TIMETABLE';
export const REORDER_TIMETABLE = BASE_STRING + 'REORDER_TIMETABLE';
export const UPDATE_CELL_SIZE = BASE_STRING + 'UPDATE_CELL_SIZE';
export const SET_IS_DRAGGING = BASE_STRING + 'SET_IS_DRAGGING';
export const SET_MOBILE_IS_TIMETABLE_TABS_OPEN = BASE_STRING + 'SET_MOBILE_IS_TIMETABLE_TABS_OPEN';
/* eslint-enable prefer-template */

export function reset() {
  return {
    type: RESET,
  };
}

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

export function setMyTimetableLectures(lectures) {
  return {
    type: SET_MY_TIMETABLE_LECTURES,
    lectures: lectures,
  };
}

export function setSelectedTimetable(timetable) {
  return {
    type: SET_SELECTED_TIMETABLE,
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

export function reorderTimetable(timetable, arrangeOrder) {
  return {
    type: REORDER_TIMETABLE,
    timetable: timetable,
    arrangeOrder: arrangeOrder,
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

export function setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen) {
  return {
    type: SET_MOBILE_IS_TIMETABLE_TABS_OPEN,
    mobileIsTimetableTabsOpen: mobileIsTimetableTabsOpen,
  };
}
