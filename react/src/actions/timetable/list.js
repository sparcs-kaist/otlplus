const BASE_STRING = 'T_L_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_SELECTED_LIST_CODE = BASE_STRING + 'SER_SELECTED_LIST_CODE';
export const SET_LIST_MAJOR_CODES = BASE_STRING + 'SET_LIST_MAJOR_CODES';
export const SET_LIST_LECTURES = BASE_STRING + 'SET_LIST_LECTURES';
export const CLEAR_LISTS_LECTURES = BASE_STRING + 'CLEAR_LISTS_LECTURES';
export const CLEAR_SEARCH_LIST_LECTURES = BASE_STRING + 'CLEAR_SEARCH_LIST_LECTURES';
export const SET_LIST_MAJOR_LECTURES = BASE_STRING + 'SET_LIST_MAJOR_LECTURES';
export const ADD_LECTURE_TO_CART = BASE_STRING + 'ADD_LECTURE_TO_CART';
export const DELETE_LECTURE_FROM_CART = BASE_STRING + 'DELETE_LECTURE_FROM_CART';
export const SET_MOBILE_SHOULD_SHOW_LECTURE_LIST = BASE_STRING + 'SET_MOBILE_SHOULD_SHOW_LECTURE_LIST';
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

export function setListMajorCodes(majors) {
  return {
    type: SET_LIST_MAJOR_CODES,
    majors: majors,
  };
}

export function setListLectures(code, lectures) {
  return {
    type: SET_LIST_LECTURES,
    code: code,
    lectures: lectures,
  };
}

export function setListMajorLectures(majorCode, lectures) {
  return {
    type: SET_LIST_MAJOR_LECTURES,
    majorCode: majorCode,
    lectures: lectures,
  };
}

export function clearListsLectures() {
  return {
    type: CLEAR_LISTS_LECTURES,
  };
}

export function clearSearchListLectures() {
  return {
    type: CLEAR_SEARCH_LIST_LECTURES,
  };
}

export function addLectureToCart(lecture) {
  return {
    type: ADD_LECTURE_TO_CART,
    lecture: lecture,
  };
}

export function deleteLectureFromCart(lecture) {
  return {
    type: DELETE_LECTURE_FROM_CART,
    lecture: lecture,
  };
}

export function setMobileShouldShowLectureList(mobileShouldShowLectureList) {
  return {
    type: SET_MOBILE_SHOULD_SHOW_LECTURE_LIST,
    mobileShouldShowLectureList: mobileShouldShowLectureList,
  };
}
