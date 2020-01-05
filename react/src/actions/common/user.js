export const SET_USER = 'SET_USER';
export const UPDATE_USER_REVIEW = 'UPDATE_USER_REVIEW';


export function setUser(user) {
  return {
    type: SET_USER,
    user: user,
  };
}

export function updateUserReview(review) {
  return {
    type: UPDATE_USER_REVIEW,
    review: review,
  };
}
