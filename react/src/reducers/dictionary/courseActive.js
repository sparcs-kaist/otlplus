import { RESET, SET_COURSE_ACTIVE, CLEAR_COURSE_ACTIVE, SET_REVIEWS, UPDATE_REVIEW, SET_LECTURES } from '../../actions/dictionary/courseActive';

const initialState = {
  clicked: false,
  course: null,
  reviews: null,
  lectures: null,
};

const courseActive = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_COURSE_ACTIVE: {
      const courseChanged = !state.course || (state.course.id !== action.course.id);
      return Object.assign({}, state, {
        clicked: action.clicked,
        course: action.course,
      },
      (courseChanged
        ? { reviews: null, lectures: null }
        : {}
      ));
    }
    case CLEAR_COURSE_ACTIVE: {
      return Object.assign({}, state, {
        clicked: false,
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
      const foundIndex = originalReviews.findIndex(r => (r.id === review.id));
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

export default courseActive;
