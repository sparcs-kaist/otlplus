import { TOGGLE_LECTURE_LIST } from '../actions';

const initialState = {
  showLectureListFlag: false,
  showTimetableListFlag: false,
};

export const mobile = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LECTURE_LIST:
      return {
        ...state,
        showLectureListFlag: !state.showLectureListFlag,
      };
    default: return state;
  }
};
