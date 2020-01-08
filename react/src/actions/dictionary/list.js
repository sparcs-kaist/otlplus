const BASE_STRING = 'D_L_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_CURRENT_LIST = BASE_STRING + 'SER_CURRENT_LIST';
export const SET_LIST_MAJOR_CODES = BASE_STRING + 'SET_LIST_MAJOR_CODES';
export const SET_LIST_COURSES = BASE_STRING + 'SET_LIST_COURSES';
export const SET_LIST_MAJOR_COURSES = BASE_STRING + 'SET_LIST_MAJOR_COURSES';
export const CLEAR_LISTS_COURSES = BASE_STRING + 'CLEAR_LISTS_COURSES';
export const CLEAR_SEARCH_LIST_COURSES = BASE_STRING + 'CLEAR_SEARCH_LIST_COURSES';
export const ADD_COURSE_READ = BASE_STRING + 'ADD_COURSE_READ';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setCurrentList(list) {
  return {
    type: SET_CURRENT_LIST,
    list: list,
  };
}

export function setListMajorCodes(majors) {
  return {
    type: SET_LIST_MAJOR_CODES,
    majors: majors,
  };
}

export function setListCourses(code, courses) {
  return {
    type: SET_LIST_COURSES,
    code: code,
    courses: courses,
  };
}

export function setListMajorCourses(majorCode, courses) {
  return {
    type: SET_LIST_MAJOR_COURSES,
    majorCode: majorCode,
    courses: courses,
  };
}

export function clearListsCourses() {
  return {
    type: CLEAR_LISTS_COURSES,
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
