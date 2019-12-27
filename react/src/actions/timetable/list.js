export const RESET = 'RESET';
export const SET_CURRENT_LIST = 'SER_CURRENT_LIST';
export const SET_LIST_MAJOR_CODES = 'SET_LIST_MAJOR_CODES';
export const SET_LIST_LECTURES = 'SET_LIST_LECTURES';
export const CLEAR_LISTS_LECTURES = 'CLEAR_LISTS_LECTURES';
export const CLEAR_SEARCH_LIST_LECTURES = 'CLEAR_SEARCH_LIST_LECTURES';
export const SET_LIST_MAJOR_LECTURES = 'SET_LIST_MAJOR_LECTURES';
export const ADD_LECTURE_TO_CART = 'ADD_LECTURE_TO_CART';
export const DELETE_LECTURE_FROM_CART = 'DELETE_LECTURE_FROM_CART';
export const SET_MOBILE_SHOW_LECTURE_LIST = 'SET_MOBILE_SHOW_LECTURE_LIST';


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

export function setMobileShowLectureList(mobileShowLectureList) {
    return {
        type: SET_MOBILE_SHOW_LECTURE_LIST,
        mobileShowLectureList: mobileShowLectureList,
    };
}