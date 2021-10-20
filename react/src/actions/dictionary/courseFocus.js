const BASE_STRING = 'D_CA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_COURSE_FOCUS = BASE_STRING + 'SET_COURSE_FOCUS';
export const CLEAR_COURSE_FOCUS = BASE_STRING + 'CLEAR_COURSE_FOCUS';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const UPDATE_REVIEW = BASE_STRING + 'UPDATE_REVIEW';
export const SET_LECTURES = BASE_STRING + 'SET_LECTURES';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setCourseFocus(course) {
  return {
    type: SET_COURSE_FOCUS,
    course: course,
  };
}

export function clearCourseFocus() {
  return {
    type: CLEAR_COURSE_FOCUS,
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
