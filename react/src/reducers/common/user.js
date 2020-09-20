import { SET_USER, UPDATE_USER_REVIEW } from '../../actions/common/user';

const initialState = {
  user: undefined,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, {
        user: action.user,
      });
    case UPDATE_USER_REVIEW: {
      const originalReviews = state.user.reviews;
      const { review } = action;
      const foundIndex = originalReviews.findIndex((r) => (r.id === review.id));
      const newReviews = (foundIndex !== -1)
        ? [
          ...originalReviews.slice(0, foundIndex),
          review,
          ...originalReviews.slice(foundIndex + 1, originalReviews.length),
        ]
        : [
          ...originalReviews.slice(),
          review,
        ];
      return Object.assign({}, state, {
        user: {
          ...state.user,
          reviews: newReviews,
        },
      });
    }
    default:
      return state;
  }
};

export default reducer;
