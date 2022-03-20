import {
  RESET,
  ADD_SEMESTER_REVIEWS,
  SET_SEMESTER_REVIEW_COUNT,
} from '../../actions/write-reviews/rankedReviews';

const initialState = {
  reviewsBySemester: {},
  reviewCountBySemester: {},
};

const latestReviews = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case ADD_SEMESTER_REVIEWS: {
      const prevReviewsOfSemester = state.reviewsBySemester[action.semester] || [];
      return Object.assign({}, state, {
        reviewsBySemester: {
          ...state.reviewsBySemester,
          [action.semester]: prevReviewsOfSemester.concat(action.reviews),
        },
      });
    }
    case SET_SEMESTER_REVIEW_COUNT: {
      return Object.assign({}, state, {
        reviewCountBySemester: {
          ...state.reviewCountBySemester,
          [action.semester]: action.count,
        },
      });
    }
    default: {
      return state;
    }
  }
};

export default latestReviews;
