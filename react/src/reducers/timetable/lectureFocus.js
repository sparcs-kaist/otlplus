import {
  RESET,
  SET_LECTURE_FOCUS,
  CLEAR_LECTURE_FOCUS,
  SET_REVIEWS,
  SET_MULTIPLE_FOCUS,
  CLEAR_MULTIPLE_FOCUS,
} from '../../actions/timetable/lectureFocus';

export const LectureFocusFrom = {
  NONE: 'NONE',
  LIST: 'LIST',
  TABLE: 'TABLE',
  MULTIPLE: 'MULTIPLE',
};

const initialState = {
  from: LectureFocusFrom.NONE,
  clicked: false,
  lecture: null,
  reviews: null,
  multipleTitle: '',
  multipleDetails: [],
};

const lectureFocus = (state = initialState, action) => {
  switch (action.type) {
    case RESET: {
      return initialState;
    }
    case SET_LECTURE_FOCUS: {
      const lectureChanged = !state.lecture || state.lecture.id !== action.lecture.id;
      return Object.assign(
        {},
        state,
        {
          from: action.from,
          clicked: action.clicked,
          lecture: action.lecture,
        },
        lectureChanged ? { reviews: null } : {},
      );
    }
    case CLEAR_LECTURE_FOCUS: {
      return Object.assign({}, state, {
        from: LectureFocusFrom.NONE,
        clicked: false,
        lecture: null,
        reviews: null,
      });
    }
    case SET_REVIEWS: {
      return Object.assign({}, state, {
        reviews: action.reviews,
      });
    }
    case SET_MULTIPLE_FOCUS: {
      return Object.assign({}, state, {
        from: LectureFocusFrom.MULTIPLE,
        multipleTitle: action.multipleTitle,
        multipleDetails: action.multipleDetails,
      });
    }
    case CLEAR_MULTIPLE_FOCUS: {
      return Object.assign({}, state, {
        from: LectureFocusFrom.NONE,
        multipleTitle: '',
        multipleDetails: [],
      });
    }
    default: {
      return state;
    }
  }
};

export default lectureFocus;
