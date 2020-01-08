const BASE_STRING = 'WR_LS_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_LECTURE_SELECTED = BASE_STRING + 'SET_LECTURE_SELECTED';
export const CLEAR_LECTURE_SELECTED = BASE_STRING + 'CLEAR_LECTURE_SELECTED';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setLectureSelected(lecture) {
  return {
    type: SET_LECTURE_SELECTED,
    lecture: lecture,
  };
}

export function clearLectureSelected() {
  return {
    type: CLEAR_LECTURE_SELECTED,
  };
}
