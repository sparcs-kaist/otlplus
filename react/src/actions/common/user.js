const BASE_STRING = 'C_U_';

export const SET_USER = BASE_STRING + 'SET_USER';
export const UPDATE_USER_REVIEW = BASE_STRING + 'UPDATE_USER_REVIEW';


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
