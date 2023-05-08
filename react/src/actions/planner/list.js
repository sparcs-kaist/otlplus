const BASE_STRING = 'P_L_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_SELECTED_LIST_CODE = BASE_STRING + 'SER_SELECTED_LIST_CODE';
export const SET_LIST_COURSES = BASE_STRING + 'SET_LIST_COURSES';
export const CLEAR_SEARCH_LIST_COURSES = BASE_STRING + 'CLEAR_SEARCH_LIST_COURSES';
export const ADD_COURSE_READ = BASE_STRING + 'ADD_COURSE_READ';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setSelectedListCode(listCode) {
  return {
    type: SET_SELECTED_LIST_CODE,
    listCode: listCode,
  };
}

export function setListCourses(code, courses) {
  return {
    type: SET_LIST_COURSES,
    code: code,
    courses: courses,
  };
}

export function clearSearchListCourses() {
  return {
    type: CLEAR_SEARCH_LIST_COURSES,
  };
}

export function addCourseRead(course) {
  return {
    type: ADD_COURSE_READ,
    course: course,
  };
}
