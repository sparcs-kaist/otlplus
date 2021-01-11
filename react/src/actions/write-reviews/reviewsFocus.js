const BASE_STRING = 'WR_LS_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_REVIEWS_FOCUS = BASE_STRING + 'SET_REVIEWS_FOCUS';
export const CLEAR_REVIEWS_FOCUS = BASE_STRING + 'CLEAR_REVIEWS_FOCUS';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setReviewsFocus(from, lecture) {
  return {
    type: SET_REVIEWS_FOCUS,
    from: from,
    lecture: lecture,
  };
}

export function clearReviewsFocus() {
  return {
    type: CLEAR_REVIEWS_FOCUS,
  };
}
