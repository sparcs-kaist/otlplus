const BASE_STRING = 'WR_LR_';

/* eslint-disable prefer-template */
export const RESET = BASE_STRING + 'RESET';
export const ADD_REVIEWS = BASE_STRING + 'ADD_REVIEWS';
export const UPDATE_REVIEW = BASE_STRING + 'UPDATE_REVIEW';
/* eslint-enable prefer-template */


export function reset() {
  return {
    type: RESET,
  };
}

export function addReviews(reviews) {
  return {
    type: ADD_REVIEWS,
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
