import {
  RESET,
  SET_COURSE_FOCUS, CLEAR_COURSE_FOCUS,
  SET_REVIEWS, UPDATE_REVIEW, SET_LECTURES,
} from '../../actions/dictionary/courseFocus';

const initialState = {
  course: null,
  reviews: null,
  lectures: null,
};

const courseFocus = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_COURSE_FOCUS: {
      const courseChanged = !state.course || (state.course.id !== action.course.id);
      return Object.assign({}, state, {
        course: action.course,
      },
      (courseChanged
        ? { reviews: null, lectures: null }
        : {}
      ));
    }
    case CLEAR_COURSE_FOCUS: {
      return Object.assign({}, state, {
        course: null,
        reviews: null,
        lectures: null,
      });
    }
    case SET_REVIEWS: {
      return Object.assign({}, state, {
        reviews: action.reviews,
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
    case SET_LECTURES: {
      return Object.assign({}, state, {
        lectures: action.lectures,
      });
    }
    default: {
      return state;
    }
  }
};

export default courseFocus;
