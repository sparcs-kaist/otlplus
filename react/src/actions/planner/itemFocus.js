const BASE_STRING = 'I_CA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_ITEM_FOCUS = BASE_STRING + 'SET_ITEM_FOCUS';
export const CLEAR_ITEM_FOCUS = BASE_STRING + 'CLEAR_ITEM_FOCUS';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const UPDATE_REVIEW = BASE_STRING + 'UPDATE_REVIEW';
export const SET_LECTURES = BASE_STRING + 'SET_LECTURES';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setItemFocus(course) {
  return {
    type: SET_ITEM_FOCUS,
    course: course,
  };
}

export function clearItemFocus() {
  return {
    type: CLEAR_ITEM_FOCUS,
  };
}

export function setReviews(reviews) {
  return {
    type: SET_REVIEWS,
    reviews: reviews,
  };
}

export function updateReview(review, isNew) {
  return {
    type: UPDATE_REVIEW,
    review: review,
    isNew: isNew,
  };
}

export function setLectures(lectures) {
  return {
    type: SET_LECTURES,
    lectures: lectures,
  };
}
