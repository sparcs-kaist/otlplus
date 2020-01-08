const BASE_STRING = 'D_CA_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_COURSE_ACTIVE = BASE_STRING + 'SET_COURSE_ACTIVE';
export const CLEAR_COURSE_ACTIVE = BASE_STRING + 'CLEAR_COURSE_ACTIVE';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const UPDATE_REVIEW = BASE_STRING + 'UPDATE_REVIEW';
export const SET_LECTURES = BASE_STRING + 'SET_LECTURES';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function setCourseActive(course, clicked) {
  return {
    type: SET_COURSE_ACTIVE,
    course: course,
    clicked: clicked,
  };
}

export function clearCourseActive() {
  return {
    type: CLEAR_COURSE_ACTIVE,
  };
}

export function setReviews(reviews) {
  return {
    type: SET_REVIEWS,
    reviews: reviews,
  };
}

export function updateReview(review) {
  return {
    type: UPDATE_REVIEW,
    review: review,
  };
}

export function setLectures(lectures) {
  return {
    type: SET_LECTURES,
    lectures: lectures,
  };
}
