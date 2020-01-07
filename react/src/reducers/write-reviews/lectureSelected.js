import { RESET, SET_LECTURE_SELECTED, CLEAR_LECTURE_SELECTED } from '../../actions/write-reviews/lectureSelected';

export const NONE = 'NONE';
export const LIST = 'LIST';
export const TABLE = 'TABLE';
export const MULTIPLE = 'MULTIPLE';

const initialState = {
  lecture: null,
};

const lectureActive = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_LECTURE_SELECTED: {
      return Object.assign({}, state, {
        lecture: action.lecture,
      });
    }
    case CLEAR_LECTURE_SELECTED: {
      return Object.assign({}, state, {
        lecture: null,
      });
    }
    default: {
      return state;
    }
  }
};

export default lectureActive;
