import { RESET, SET_REVIEWS_FOCUS, CLEAR_REVIEWS_FOCUS } from '../../actions/write-reviews/reviewsFocus';

export const NONE = 'NONE';
export const LECTURE = 'LECTURE';
export const LATEST = 'LATEST';
export const MY = 'MY';

const initialState = {
  from: 'NONE',
  lecture: null,
};

const reviewsFocus = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_REVIEWS_FOCUS: {
      return Object.assign({}, state, {
        from: action.from,
        lecture: action.lecture,
      });
    }
    case CLEAR_REVIEWS_FOCUS: {
      return Object.assign({}, state, {
        from: 'NONE',
        lecture: null,
      });
    }
    default: {
      return state;
    }
  }
};

export default reviewsFocus;
