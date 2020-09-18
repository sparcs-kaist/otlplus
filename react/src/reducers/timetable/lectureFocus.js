import { RESET, SET_LECTURE_FOCUS, CLEAR_LECTURE_FOCUS, SET_MULTIPLE_DETAIL, CLEAR_MULTIPLE_DETAIL } from '../../actions/timetable/lectureFocus';

export const NONE = 'NONE';
export const LIST = 'LIST';
export const TABLE = 'TABLE';
export const MULTIPLE = 'MULTIPLE';

const initialState = {
  from: NONE,
  clicked: false,
  lecture: null,
  title: '',
  multipleDetail: [],
};

const lectureFocus = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_LECTURE_FOCUS: {
      return Object.assign({}, state, {
        from: action.from,
        clicked: action.clicked,
        lecture: action.lecture,
      });
    }
    case CLEAR_LECTURE_FOCUS: {
      return Object.assign({}, state, {
        from: NONE,
        clicked: false,
        lecture: null,
      });
    }
    case SET_MULTIPLE_DETAIL: {
      return Object.assign({}, state, {
        from: MULTIPLE,
        title: action.title,
        multipleDetail: action.multipleDetail,
      });
    }
    case CLEAR_MULTIPLE_DETAIL: {
      return Object.assign({}, state, {
        from: NONE,
        title: '',
        multipleDetail: [],
      });
    }
    default: {
      return state;
    }
  }
};

export default lectureFocus;
