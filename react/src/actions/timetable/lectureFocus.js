const BASE_STRING = 'T_LA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_LECTURE_FOCUS = BASE_STRING + 'SET_LECTURE_FOCUS';
export const CLEAR_LECTURE_FOCUS = BASE_STRING + 'CLEAR_LECTURE_FOCUS';
export const SET_MULTIPLE_DETAIL = BASE_STRING + 'SET_MULTIPLE_DETAIL';
export const CLEAR_MULTIPLE_DETAIL = BASE_STRING + 'CLEAR_MULTIPLE_DETAIL';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setLectureFocus(lecture, from, clicked) {
  return {
    type: SET_LECTURE_FOCUS,
    lecture: lecture,
    from: from,
    clicked: clicked,
  };
}

export function clearLectureFocus() {
  return {
    type: CLEAR_LECTURE_FOCUS,
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
