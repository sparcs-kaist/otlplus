import {
  RESET,
  SET_REVIEWS_FOCUS, CLEAR_REVIEWS_FOCUS,
  SET_REVIEWS,
} from '../../actions/write-reviews/reviewsFocus';

export const NONE = 'NONE';
export const LECTURE = 'LECTURE';
export const LATEST = 'LATEST';
export const MY = 'MY';
export const LIKED = 'LIKED';

const initialState = {
  from: 'NONE',
  lecture: null,
  reviews: null,
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
        reviews: null,
      });
    }
    case CLEAR_REVIEWS_FOCUS: {
      return Object.assign({}, state, {
        from: 'NONE',
        lecture: null,
        reviews: null,
      });
    }
    case SET_REVIEWS: {
      return Object.assign({}, state, {
        reviews: action.reviews,
      });
    }
    default: {
      return state;
    }
  }
};

export default reviewsFocus;
