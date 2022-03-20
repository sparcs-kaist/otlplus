const BASE_STRING = 'T_LA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_LECTURE_FOCUS = BASE_STRING + 'SET_LECTURE_FOCUS';
export const CLEAR_LECTURE_FOCUS = BASE_STRING + 'CLEAR_LECTURE_FOCUS';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const SET_MULTIPLE_FOCUS = BASE_STRING + 'SET_MULTIPLE_FOCUS';
export const CLEAR_MULTIPLE_FOCUS = BASE_STRING + 'CLEAR_MULTIPLE_FOCUS';
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

export function setReviews(reviews) {
  return {
    type: SET_REVIEWS,
    reviews: reviews,
  };
}

export function setMultipleFocus(multipleTitle, multipleDetails) {
  return {
    type: SET_MULTIPLE_FOCUS,
    multipleTitle: multipleTitle,
    multipleDetails: multipleDetails,
  };
}

export function clearMultipleFocus() {
  return {
    type: CLEAR_MULTIPLE_FOCUS,
  };
}
