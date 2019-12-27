import { RESET, SET_COURSE_ACTIVE, CLEAR_COURSE_ACTIVE, SET_REVIEWS, SET_LECTURES } from '../../actions/dictionary/courseActive';

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
