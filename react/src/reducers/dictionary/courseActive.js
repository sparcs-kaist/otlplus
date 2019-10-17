import { SET_COURSE_ACTIVE, CLEAR_COURSE_ACTIVE } from '../../actions/dictionary/courseActive';

const initialState = {
  clicked: false,
  course: null,
};

const courseActive = (state = initialState, action) => {
  switch (action.type) {
    case SET_COURSE_ACTIVE: {
      return Object.assign({}, state, {
        clicked: action.clicked,
        course: action.course,
      });
    }
    case CLEAR_COURSE_ACTIVE: {
      return Object.assign({}, state, {
        clicked: false,
        course: null,
      });
    }
    default: {
      return state;
    }
  }
};

export default courseActive;
