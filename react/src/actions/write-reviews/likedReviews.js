const BASE_STRING = 'WR_LkR_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const SET_REVIEWS = BASE_STRING + 'SET_REVIEWS';
export const UPDATE_REVIEW = BASE_STRING + 'UPDATE_REVIEW';
/* eslint-enable prefer-template */

export function reset() {
  return {
    type: RESET,
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
