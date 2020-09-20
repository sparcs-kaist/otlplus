import { RESET, ADD_REVIEWS, UPDATE_REVIEW } from '../../actions/write-reviews/latestReviews';

const initialState = {
  reviews: [],
};

const latestReviews = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case ADD_REVIEWS: {
      const newReviews = [
        ...state.reviews,
        ...action.reviews,
      ];
      return Object.assign({}, state, {
        reviews: newReviews,
      });
    }
    case UPDATE_REVIEW: {
      const originalReviews = state.reviews;
      const { review, isNew } = action;
      const foundIndex = originalReviews.findIndex((r) => (r.id === review.id));
      const newReviews = (foundIndex !== -1)
        ? [
          ...originalReviews.slice(0, foundIndex),
          review,
          ...originalReviews.slice(foundIndex + 1, originalReviews.length),
        ]
        : (isNew
          ? [
            review,
            ...originalReviews.slice(),
          ]
          : [
            ...originalReviews.slice(),
          ]
        );
      return Object.assign({}, state, {
        reviews: newReviews,
      });
    }
    default: {
      return state;
    }
  }
};

export default latestReviews;
