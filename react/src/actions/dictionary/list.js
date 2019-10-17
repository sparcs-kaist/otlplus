export const SET_CURRENT_LIST = 'SER_CURRENT_LIST';
export const SET_LIST_MAJOR_CODES = 'SET_LIST_MAJOR_CODES';
export const SET_LIST_COURSES = 'SET_LIST_COURSES';
export const SET_LIST_MAJOR_COURSES = 'SET_LIST_MAJOR_COURSES';
export const CLEAR_LISTS_COURSES = 'CLEAR_LISTS_COURSES';
export const CLEAR_SEARCH_LIST_COURSES = 'CLEAR_SEARCH_LIST_COURSES';


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
    type: CLEAR_LISTS_COURSES,
  };
}
