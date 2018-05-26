import { TOGGLE_LECTURE_LIST } from '../actions';

const initialState = {
  showLectureList: false,
  showTimetableList: false,
};

export const mobile = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LECTURE_LIST:
      return {
        ...state,
        showLectureList: !state.showLectureList,
      };
    default: return state;
  }
};
