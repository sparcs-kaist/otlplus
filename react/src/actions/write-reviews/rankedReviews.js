const BASE_STRING = 'WR_RR_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const ADD_SEMESTER_REVIEWS = BASE_STRING + 'ADD_SEMESTER_REVIEWS';
export const SET_SEMESTER_REVIEW_COUNT = BASE_STRING + 'SET_SEMESTER_REVIEW_COUNT';
/* eslint-enable prefer-template */

export function reset() {
  return {
    type: RESET,
  };
}

export function addSemesterReviews(semester, reviews) {
  return {
    type: ADD_SEMESTER_REVIEWS,
    semester: semester,
    reviews: reviews,
  };
}

export function setSemesterReviewCount(semester, count) {
  return {
    type: SET_SEMESTER_REVIEW_COUNT,
    semester: semester,
    count: count,
  };
}
