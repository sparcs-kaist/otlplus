const BASE_STRING = 'WR_RF_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_REVIEWS_FOCUS = BASE_STRING + 'SET_REVIEWS_FOCUS';
export const CLEAR_REVIEWS_FOCUS = BASE_STRING + 'CLEAR_REVIEWS_FOCUS';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
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

export function setReviews(reviews) {
  return {
    type: SET_REVIEWS,
    reviews: reviews,
  };
}
